import { Context, Schema } from 'koishi'
import { watch } from '@vue/reactivity'

import type { } from '@koishijs/plugin-server'
import type { } from '@koishijs/plugin-notifier'

import type { Config as ConfigType } from './types'
import { ConfigSchema } from './config'
import { initLogger, loggerInfo } from './logger'
import { clearConfigCache, loadAllProviders, loadProviderIndex, findProvider } from './remoteConfig'
import { registerModelRoutes } from './routes/models'
import { registerChatRoute } from './routes/chat'

export const name = 'freeluna'
export const reusable = false
export const filter = false

export const inject = {
  required: ['server', 'notifier'],
}

export const usage = `
---

<p>🌙 <strong>FreeLuna</strong> - 免费 LLM API 服务</p>
<p>➣ 挂载 OpenAI 兼容接口，动态加载免费 API 配置</p>
<p>➣ 无需频繁更新插件，只需更新远程配置文件即可切换免费 API</p>

---

示例用法：使用 <code>chatluna-openai-like-adapter</code> 适配器，

1. 填入请求地址（默认）

    \`http://localhost:5140/freeluna/openai-compatible/v1\`
2. 填入秘钥（默认）

    <code>sk-freeluna-default</code>

3. 开启<code>chatluna-openai-like-adapter</code> 适配器，

    然后使用\`freeluna-\`前缀的模型即可！
---
`

export const Config = ConfigSchema

export function apply(ctx: Context, config: ConfigType) {
  // 先初始化 logger，确保后续调用不会出错
  initLogger(ctx, config)

  // 立即更新动态 Schema，不等待 ready 事件
  loadProviderIndex(ctx, config).then(index => {
    const modelNames = index?.providers.map(p => `freeluna-${p.name}`) ?? []
    if (modelNames.length > 0) {
      ctx.schema.set('freeluna.testmodels', Schema.union(modelNames))
    }
  }).catch(() => {
    // 如果加载失败，设置一个默认的空选项
    ctx.schema.set('freeluna.testmodels', Schema.union(['加载中...', '加载中']))
  })

  ctx.on('ready', async () => {
    registerModelRoutes(ctx, config)
    registerChatRoute(ctx, config)

    loggerInfo(`服务已启动：http://localhost:${ctx.server.port}${config.basePath}/openai-compatible/v1/chat/completions`)
    const providers = await loadAllProviders(ctx, config)
    if (providers.length === 0) {
      loggerInfo('警告：未能加载任何提供商，请检查配置后重启插件')
    }

    // 注册测试指令
    if (config.testEnabled && config.testCommand) {
      ctx.command(`${config.testCommand} [...input:text]`, '测试 FreeLuna 模型')
        .action(async ({ session }, ...args) => {
          if (!config.testModel) {
            return '未配置测试模型'
          }

          const userInput = args.join(' ')
          if (!userInput) {
            return '请输入要测试的内容'
          }

          try {
            // 获取提供商名称
            const providerName = config.testModel.startsWith('freeluna-')
              ? config.testModel.slice('freeluna-'.length)
              : config.testModel

            // 查找提供商
            const provider = await findProvider(ctx, providerName, config)
            if (!provider) {
              return `未找到提供商: ${providerName}`
            }

            // 调用 API
            const messages = [{ role: 'user' as const, content: userInput }]
            const response = await provider.module.chat(messages, {
              model: config.testModel,
            })

            return response
          } catch (err) {
            loggerInfo(`测试指令执行失败: ${err instanceof Error ? err.message : err}`)
            return `请求失败: ${err instanceof Error ? err.message : String(err)}`
          }
        })
    }
  })

  ctx.on('dispose', () => {
    clearConfigCache()
  })
}
