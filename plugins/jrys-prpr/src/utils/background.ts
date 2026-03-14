import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Config } from '../types'

export function getRandomBackground(config: Pick<Config, 'BackgroundURL'>): string {
  const rawPath = config.BackgroundURL[Math.floor(Math.random() * config.BackgroundURL.length)]
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath
  }
  try {
    return handleLocalPath(rawPath)
  } catch (error) {
    throw new Error(`处理本地背景路径失败: "${rawPath}". 错误: ${error.message}`)
  }
}

export function getBackgroundForChannel(config: Config, channelId: string): string {
  const groupUrls = config.groupBackgroundConfig?.[channelId]
  if (groupUrls && groupUrls.length > 0) {
    return getRandomBackground({ BackgroundURL: groupUrls })
  }
  return getRandomBackground(config)
}

function handleLocalPath(filePath: string): string {
  let localPath: string
  if (filePath.startsWith('file:///')) {
    try {
      localPath = fileURLToPath(filePath)
    } catch (error) {
      throw new Error(`无效的 file URL: ${filePath}`)
    }
  } else {
    localPath = filePath
  }

  if (!fs.existsSync(localPath)) {
    throw new Error(`路径不存在: ${localPath}`)
  }

  const stats = fs.lstatSync(localPath)

  if (stats.isDirectory()) {
    // 同时支持图片和 txt 文件
    const allFiles = fs.readdirSync(localPath).filter((file) =>
      /\.(jpg|png|gif|bmp|webp|txt)$/i.test(file)
    )
    if (allFiles.length === 0) {
      throw new Error(`文件夹 "${localPath}" 中未找到有效图片或txt文件`)
    }
    const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)]
    const fullPath = path.join(localPath, randomFile)
    if (randomFile.toLowerCase().endsWith('.txt')) {
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').filter(Boolean)
      if (lines.length === 0) {
        throw new Error(`.txt 文件为空: ${fullPath}`)
      }
      return lines[Math.floor(Math.random() * lines.length)].trim()
    }
    return pathToFileURL(fullPath).href
  }

  if (stats.isFile()) {
    if (localPath.endsWith('.txt')) {
      const lines = fs.readFileSync(localPath, 'utf-8').split('\n').filter(Boolean)
      if (lines.length === 0) {
        throw new Error(`.txt 文件为空: ${localPath}`)
      }
      return lines[Math.floor(Math.random() * lines.length)].trim()
    }
    if (/\.(jpg|png|gif|bmp|webp)$/i.test(localPath)) {
      return pathToFileURL(localPath).href
    }
  }

  throw new Error(`不支持的本地路径格式: ${localPath}`)
}
