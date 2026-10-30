#!/usr/bin/env node
// 独立版入口：没有 Electron 外壳，起本地管理页，其余能力与核心包一致。
//
// 核心按「有没有原生外壳」决定若干行为（打开方式、更新检查）；这里统一把 npm 形态的
// 环境变量设好，再交给 start.js——端口、日志、单实例唤醒都在那边，入口不重复实现。

import { existsSync, readFileSync } from 'node:fs'
import { delimiter, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const args = process.argv.slice(2)

const HELP = `dsh-x ${pkg.version}

用法：
  dsh-x                  启动管理页（默认用系统浏览器打开）
  dsh-x --port <端口>     指定管理页端口；缺省用设置里保存的端口，再缺省 3780
  dsh-x --no-open        只启动服务，不打开浏览器
  dsh-x --data-dir <目录>   dsh 版本的安装目录
  dsh-x --dsh-home <目录>   dsh 的用户目录（默认 ~/.dsh）
  dsh-x --version        打印版本
  dsh-x --help           打印帮助

环境变量与同名参数等价：PORT、DSH_VERSIONS_DATA、DSH_HOME。
`

function fail(message) {
  process.stderr.write(`dsh-x: ${message}\n\n${HELP}`)
  process.exit(1)
}

/** 取 `--flag value` 的值；缺值、空值、紧接着另一个参数都按用法错误处理。 */
function take(flag) {
  const at = args.indexOf(flag)
  if (at < 0) return ''
  const value = String(args[at + 1] ?? '').trim()
  if (!value || value.startsWith('--')) fail(`${flag} 后面要跟一个值`)
  return value
}

if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(HELP)
} else if (args.includes('--version') || args.includes('-v')) {
  process.stdout.write(`${pkg.version}\n`)
} else {
  const port = take('--port')
  const dataDir = take('--data-dir')
  const dshHome = take('--dsh-home')
  if (port) {
    const number = Number(port)
    if (!Number.isInteger(number) || number < 1 || number > 65535) fail(`端口不合法：${port}`)
    process.env.PORT = String(number)
  }
  if (dataDir) process.env.DSH_VERSIONS_DATA = dataDir
  if (dshHome) process.env.DSH_HOME = dshHome
  if (args.includes('--no-open')) process.env.DSH_X_NO_OPEN = '1'

  // 核心把 npm 版当作「由 npm 分发」的形态：更新检查走 registry，不查安装包。
  process.env.DSH_NPM = '1'

  // 插件命令是 dsh 内部调 pnpm：pnpm 作为依赖装在包根的 node_modules/.bin。
  // 追加到 PATH 末尾，用户自己的 pnpm 仍然优先（store 版本要和 profile 对得上）。
  const localBin = join(ROOT, 'node_modules', '.bin')
  if (existsSync(localBin)) {
    process.env.PATH = [process.env.PATH, localBin].filter(Boolean).join(delimiter)
  }

  await import('../start.js')
}
