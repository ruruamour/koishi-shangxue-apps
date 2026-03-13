import { defineComponent, h, resolveComponent } from 'vue'
import { Context, receive, send } from '@koishijs/client'
import ChatOnebot from './page.vue'
import './icons'
import './index.scss'

type InstanceInfo = { mode: 'online' | 'local', basePath: string }

export default (ctx: Context) => {
  const pageDisposers = new Map<string, () => void>()

  function syncPages(instances: InstanceInfo[]) {
    const currentPaths = new Set(instances.map(i => i.basePath))

    for (const [basePath, dispose] of pageDisposers) {
      if (!currentPaths.has(basePath)) {
        dispose()
        pageDisposers.delete(basePath)
      }
    }

    for (const inst of instances) {
      if (pageDisposers.has(inst.basePath)) continue
      const iframeUrl = inst.mode === 'online'
        ? 'https://stapxs.github.io/Stapxs-QQ-Lite-2.0/'
        : `${inst.basePath}/local`
      const dispose = ctx.page({
        name: inst.basePath === '/chat-onebot'
          ? 'Stapxs QQ Lite'
          : `Stapxs QQ Lite (${inst.basePath})`,
        path: inst.basePath,
        authority: 4,
        icon: 'activity:chat-onebot',
        component: defineComponent({
          setup() {
            return () => h(resolveComponent('k-layout'), {}, {
              default: () => h(ChatOnebot, { iframeUrl })
            })
          },
        }),
      })
      pageDisposers.set(inst.basePath, dispose)
    }
  }

  ;(send as any)('chat-onebot/get-instances').then((instances: InstanceInfo[]) => {
    syncPages(instances)
  })

  receive<InstanceInfo[]>('chat-onebot/instances', syncPages)
}
