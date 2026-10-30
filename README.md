# DSH-X 核心 · 独立 npm 版

原上游[DSH-X](https://github.com/yyh-001/DSH-X) 是 DeepSeek Harness 的第三方启动器：启动项与多实例，版本、插件、整合包、MCP 和技能管理。   
这个包fork自它的核心层，并去掉 Electron 外壳，用一条命令起本地管理页，再用系统浏览器操作。  
使用本包，需要自行安装Node.js 22.18+，并搭配支持现代Web技术（建议使用chromium内核的浏览器）的浏览器使用。

> [!IMPORTANT]
> **请向上游贡献，不要提交给本仓库**  
> 上游项目DSH-X虽然外包有electron外壳，但95%以上的功能，都是依靠一个独立的Node Web程序运行的（即核心包），其本身就支持以纯Web模式运行在浏览器中用于调试。这也是本项目存在的基础。   
> 本分支仅仅增加了几个很小的补丁，让它的这个核心包的浏览器调试/回退变成默认启动路径，不再绑定electron外壳，再让检测到是浏览器运行时，隐藏一些需要独立桌面外壳的特殊配置项。  
> 如果你使用本项目发现问题，那有极大极大可能是上游本身出现的问题，请优先向上游贡献，仅在确认确实是我们分支存在问题时再向我们贡献。  
> 我们会尽可能保证和上游的兼容性。

## 安装

```sh
# 全局安装到本地
npm install -g @melorise/dsh-x-core-standalone
# 后续的启动命令
dsh-x
```

也可以不装：

```sh
# 临时运行。配置和安装的DSH均保存在独立的持久化目录，再次运行不会导致配置删除。
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

本仓库是 [DSH-X](https://github.com/yyh-001/DSH-X) 核心的独立发行分支，跟随上游同步，差异只有三块：`dsh-x` 入口、没有外壳时收起依赖外壳的界面元素、更新检查改走 npm。

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
