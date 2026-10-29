# DSH-X 核心 · 独立 npm 版

DSH-X 是 DeepSeek Harness 的第三方启动器：启动项与多实例，版本、插件、整合包、MCP 和技能管理。
这个包是它的核心层，去掉 Electron 外壳，用一条命令起本地管理页，再用系统浏览器操作。

## 安装

```sh
npm install -g @melorise/dsh-x-core-standalone
dsh-x
```

也可以不装：

```sh
npx @melorise/dsh-x-core-standalone
```

启动后自动打开 `http://127.0.0.1:3780/`；端口被占用时顺延，地址会打印在终端里。

## 命令

```sh
dsh-x                    启动管理页并打开浏览器
dsh-x --no-open          只启动服务（远程登录、后台运行）
dsh-x --port 42100       指定管理页端口
dsh-x --data-dir <目录>  dsh 版本的安装目录
dsh-x --dsh-home <目录>   dsh 的用户目录（默认 ~/.dsh）
dsh-x --version          打印版本
dsh-x --help             打印帮助
```

`PORT`、`DSH_VERSIONS_DATA`、`DSH_HOME` 三个环境变量与同名参数等价。

## 设置与数据

配置目录与桌面版共用：Windows `%APPDATA%\DSH`、macOS `~/Library/Application Support/DSH`、Linux `$XDG_CONFIG_HOME/DSH`（默认 `~/.config/DSH`）。dsh 本体的数据在 `DSH_HOME`（默认 `~/.dsh`），跨版本共享。同一台机器上两套同时开时，先启动的那个占用管理页端口，后启动的会唤醒它。

## 能做什么

- 启动项与多实例：按项选择用户目录、profile、版本和端口，可并行启动。
- 版本管理：检测、安装、卸载 dsh 版本，给启动项指定版本。
- 插件与整合包：按环境安装、开关、更新插件；导入导出 `.dspack`，浏览社区市场。
- MCP 与技能：配置 MCP 服务器，导入、管理和开关技能。
- 打开方式：浏览器标签页、浏览器独立窗口（需要本机装有 Chrome、Chromium 或 Edge）。
- 其他：深浅主题、Web 绑定、开机自启、故障恢复、日志导出。

## 更新

设置 → 关于 → **检查更新** 会查询 npm 上的新版本，并给出更新命令：

```sh
npm install -g @melorise/dsh-x-core-standalone@latest
```

## 与上游的关系

本仓库是 [DSH-X](https://github.com/yyh-001/DSH-X) 核心的独立发行分支，跟随上游同步，差异只有三块：`dsh-x` 入口、没有外壳时收起依赖外壳的界面元素、更新检查改走 npm。Linux 上按 PATH 查找 Chromium 的修复单独放在 `fix/linux-chromium-lookup` 分支，先推给上游。

## 开发

本机需要 Node.js 22.18+。

```sh
npm install       # 只装 pnpm（插件命令要用）
npm start         # 起管理页
npm test          # 全部用例
node bin/dsh-x.mjs --no-open
```

## 许可

MIT。DSH-X 是社区项目，并非 DeepSeek 官方产品。
