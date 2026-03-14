import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Context } from 'koishi'
import type { Config } from '../types'

export const defaultFontName = '千图马克手写体lite'
export const localFontPath = path.join(__dirname, './../data/千图马克手写体lite.ttf')
let cachedFontBase64: string | null = null

/**
 * 插件启动时调用，确保字体在 glyph 服务中注册
 * 注意：传入 checkFont 前去掉扩展名，防止 glyph 找不到文件后触发错误下载
 */
export async function initializeFont(ctx: Context, config: Config) {
  if (ctx.glyph) {
    const rawFontName = config.HTML_setting.font || defaultFontName
    // 去掉可能带的扩展名（如 "萝莉体.TTC" → "萝莉体"），防止触发错误下载
    const fontName = rawFontName.replace(/\.[^.]+$/, '') || defaultFontName
    const fontFileUrl = pathToFileURL(localFontPath).href
    const fontExists = await ctx.glyph.checkFont(fontName, fontFileUrl)
    if (fontExists) {
      ctx.logger.info(`字体已通过 glyph 服务加载: ${fontName}`)
    } else {
      ctx.logger.warn(`字体加载到 glyph 服务失败: ${fontName}`)
    }
  } else {
    ctx.logger.info('未检测到 glyph 服务，将使用本地字体文件')
  }
}

/**
 * 渲染时调用，返回字体 data URL 和字体名
 * 同样去掉扩展名，保证查询 key 与 glyph 内部存储一致
 * 最多重试 5 次应对 glyph 异步加载未就绪的情况
 */
export async function getFontDataUrl(ctx: Context, config: Config, logInfo: (...args: any[]) => void) {
  let fontDataUrl: string | null = null
  let selectedFont = defaultFontName
  if (ctx.glyph) {
    const rawSelectedFont = config.HTML_setting.font || defaultFontName
    selectedFont = rawSelectedFont.replace(/\.[^.]+$/, '') || defaultFontName
    for (let i = 0; i < 5; i++) {
      fontDataUrl = ctx.glyph.getFontDataUrl(selectedFont)
      if (fontDataUrl) break
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    if (!fontDataUrl) {
      ctx.logger.warn(`未在 glyph 服务中找到字体: ${selectedFont}，将使用本地字体`)
    } else {
      logInfo(`使用 glyph 字体: ${selectedFont}`)
    }
  }
  if (!fontDataUrl) {
    if (!cachedFontBase64) {
      cachedFontBase64 = await getFontBase64(localFontPath)
    }
    fontDataUrl = `data:font/ttf;base64,${cachedFontBase64}`
    logInfo(`使用本地字体: ${defaultFontName}`)
  }
  return { fontDataUrl, selectedFont }
}

async function getFontBase64(fontPath: string): Promise<string> {
  const fontBuffer = fs.readFileSync(fontPath)
  return fontBuffer.toString('base64')
}
