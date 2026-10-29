import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { checkStandaloneUpdate, distTagVersion, metadataUrl, updateCommand } from '../npm-update.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BIN = join(ROOT, 'bin', 'dsh-x.mjs')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

test('包名与入口指向独立版：dsh-x 命令、运行时文件都在 files 里', () => {
  assert.equal(pkg.name, '@melorise/dsh-x-core-standalone')
  assert.equal(pkg.bin['dsh-x'], 'bin/dsh-x.mjs')
  for (const file of ['server.js', 'start.js', 'npm-update.js', 'public', 'compat', 'perf', 'packs']) {
    assert.ok(pkg.files.includes(file), `${file} 要随包发`)
  }
  assert.ok(!pkg.files.includes('shell'), '外壳不进独立包')
  assert.equal(pkg.private, false)
  assert.equal(pkg.publishConfig.access, 'public')
})

test('入口：--version 与 --help 不启动服务', () => {
  const version = spawnSync(process.execPath, [BIN, '--version'], { encoding: 'utf8' })
  assert.equal(version.status, 0)
  assert.equal(version.stdout.trim(), pkg.version)

  const help = spawnSync(process.execPath, [BIN, '--help'], { encoding: 'utf8' })
  assert.equal(help.status, 0)
  assert.match(help.stdout, /dsh-x --port/)
  assert.match(help.stdout, /--no-open/)
})

test('入口：参数不合法时以非零退出并给出用法', () => {
  const badPort = spawnSync(process.execPath, [BIN, '--port', '0'], { encoding: 'utf8' })
  assert.equal(badPort.status, 1)
  assert.match(badPort.stderr, /端口不合法/)

  const missing = spawnSync(process.execPath, [BIN, '--data-dir', '--no-open'], { encoding: 'utf8' })
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /后面要跟一个值/)
})

test('入口：把包内的 node_modules/.bin 追加到 PATH 末尾，用户自己的 pnpm 仍然优先', () => {
  const root = mkdtempSync(join(tmpdir(), 'dsh-x-entry-'))
  mkdirSync(join(root, 'bin'), { recursive: true })
  mkdirSync(join(root, 'node_modules', '.bin'), { recursive: true })
  cpSync(BIN, join(root, 'bin', 'dsh-x.mjs'))
  writeFileSync(join(root, 'package.json'), `${JSON.stringify({ name: 'stub', version: '9.9.9' })}\n`)
  // 用一份假的 start.js 顶替核心：它把入口设好的环境原样写出来
  writeFileSync(join(root, 'start.js'), 'process.stdout.write(JSON.stringify({ path: process.env.PATH, npm: process.env.DSH_NPM, noOpen: process.env.DSH_X_NO_OPEN }))\n')

  const userBin = join(root, 'user-bin')
  const result = spawnSync(process.execPath, [join(root, 'bin', 'dsh-x.mjs'), '--no-open'], {
    encoding: 'utf8',
    env: { ...process.env, PATH: userBin },
  })
  assert.equal(result.status, 0, result.stderr)
  const env = JSON.parse(result.stdout)
  assert.equal(env.npm, '1', '核心按 npm 分发的形态处理更新检查')
  assert.equal(env.noOpen, '1')
  assert.equal(env.path, [userBin, join(root, 'node_modules', '.bin')].join(delimiter), '追加在末尾，用户的工具优先')
})

test('npm 元数据地址：scoped 包的名字要编码斜杠', () => {
  assert.equal(metadataUrl('https://registry.example.com/', '@melorise/dsh-x-core-standalone'),
    'https://registry.example.com/@melorise%2Fdsh-x-core-standalone')
})

test('dist-tags 取 latest，缺了就是空串', () => {
  assert.equal(distTagVersion({ 'dist-tags': { latest: '0.2.0' } }), '0.2.0')
  assert.equal(distTagVersion({ 'dist-tags': { next: '0.2.0' } }), '')
  assert.equal(distTagVersion(null), '')
})

test('更新命令就是全局安装 latest', () => {
  assert.equal(updateCommand(), 'npm install -g @melorise/dsh-x-core-standalone@latest')
})

/** 起一个只回固定 JSON 的 registry；返回地址与关闭函数。 */
function registryServer(body) {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      url: `http://127.0.0.1:${server.address().port}`,
      close: () => new Promise((done) => server.close(done)),
    }))
  })
}

test('更新检查：官方连不上时退到镜像，新版本号与更新命令一起返回', async () => {
  const mirror = await registryServer({ 'dist-tags': { latest: '0.2.0' } })
  try {
    const result = await checkStandaloneUpdate({ current: '0.1.22', registries: ['http://127.0.0.1:1', mirror.url] })
    assert.equal(result.current, '0.1.22')
    assert.equal(result.latest, '0.2.0')
    assert.equal(result.update, true)
    assert.equal(result.command, 'npm install -g @melorise/dsh-x-core-standalone@latest')
    assert.equal(result.error, undefined)
  } finally {
    await mirror.close()
  }
})

test('更新检查：已经是最新版本时 update 为 false', async () => {
  const registry = await registryServer({ 'dist-tags': { latest: '0.1.22' } })
  try {
    const result = await checkStandaloneUpdate({ current: '0.1.22', registries: [registry.url] })
    assert.equal(result.update, false)
  } finally {
    await registry.close()
  }
})

test('更新检查：registry 都连不上时带上错误，更新命令照常给出', async () => {
  const result = await checkStandaloneUpdate({ current: '0.1.22', registries: ['http://127.0.0.1:1'] })
  assert.equal(result.update, false)
  assert.ok(result.error)
  assert.equal(result.command, 'npm install -g @melorise/dsh-x-core-standalone@latest')
})
