// 独立包的更新检查：查 npm registry 的 dist-tags，给出新版本号与更新命令。
//
// 只报告、不代跑 npm：全局目录的写权限因安装方式而异（系统包管理器、nvm、pnpm 全局），
// 由使用者在自己的终端里执行更新命令，权限与 npm 前缀都按他那套来。
//
// registry 先官方、失败再走镜像：镜像同步有延迟，正式版本以官方为准；被墙的网络上
// 官方一般连不上，退到镜像还能拿到结果。

import { netFetch } from './proxy.js'
import { cmpVer, parseVer } from './version.js'

/** 独立版的 npm 包名。 */
export const STANDALONE_PACKAGE = '@melorise/dsh-x-core-standalone'

export const REGISTRIES = ['https://registry.npmjs.org', 'https://registry.npmmirror.com']

/** 包元数据地址；scoped 包的名字要把斜杠编码。 */
export function metadataUrl(registry, name = STANDALONE_PACKAGE) {
  const base = String(registry || '').replace(/\/+$/, '')
  const encoded = name.startsWith('@') ? name.replace('/', '%2F') : name
  return `${base}/${encoded}`
}

/** 从 npm 元数据取 latest 指向的版本；取不到返回空串。 */
export function distTagVersion(metadata) {
  return String(metadata?.['dist-tags']?.latest || '').trim()
}

/** 使用者要执行的更新命令。 */
export function updateCommand(name = STANDALONE_PACKAGE) {
  return `npm install -g ${name}@latest`
}

/**
 * 查有没有新版本。返回 { current, latest, update, command }；registry 都没连上时
 * 带上 error，页面按「检查失败」显示，更新命令照常给出。
 */
export async function checkStandaloneUpdate({ current, name = STANDALONE_PACKAGE, registries = REGISTRIES, signal } = {}) {
  const command = updateCommand(name)
  let lastError = null
  for (const registry of registries) {
    const timeout = AbortSignal.timeout(15_000)
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
    try {
      const res = await netFetch(metadataUrl(registry, name), {
        redirect: 'follow',
        headers: { accept: 'application/json', 'user-agent': 'dsh-x' },
        signal: combined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const latest = distTagVersion(await res.json())
      if (!latest) throw new Error('元数据里没有 latest')
      const now = parseVer(current)
      const next = parseVer(latest)
      return { current: String(current || ''), latest, update: Boolean(now && next && cmpVer(next, now) > 0), command }
    } catch (error) {
      lastError = error
    }
  }
  return {
    current: String(current || ''),
    latest: '',
    update: false,
    command,
    error: lastError instanceof Error ? lastError.message : String(lastError || ''),
  }
}
