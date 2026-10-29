# DSH-X Core · Standalone npm package

DSH-X is a third-party launcher for DeepSeek Harness: launch entries and multiple instances, versions, plugins, modpacks, MCP and skills.
This package is its core layer without the Electron shell. One command starts the local manager page, and you use it from your system browser.

## Install

```sh
npm install -g @melorise/dsh-x-core-standalone
dsh-x
```

Or run it without installing:

```sh
npx @melorise/dsh-x-core-standalone
```

It opens `http://127.0.0.1:3780/`; if the port is taken it moves to the next free one and prints the address in the terminal.

## Commands

```sh
dsh-x                    start the manager page and open the browser
dsh-x --no-open          start the server only (remote login, background use)
dsh-x --port 42100       pick the manager port
dsh-x --data-dir <dir>   where dsh versions are installed
dsh-x --dsh-home <dir>   dsh home directory (default ~/.dsh)
dsh-x --version          print the version
dsh-x --help             print help
```

`PORT`, `DSH_VERSIONS_DATA` and `DSH_HOME` are equivalent to the matching flags.

## Settings and data

The config directory is shared with the desktop build: `%APPDATA%\DSH` on Windows, `~/Library/Application Support/DSH` on macOS, `$XDG_CONFIG_HOME/DSH` on Linux (`~/.config/DSH` by default). dsh data lives in `DSH_HOME` (default `~/.dsh`) and is shared across versions. When both builds run on one machine, whichever starts first owns the manager port and the second wakes it.

## What it does

- Launch entries and multiple instances: per-entry home directory, profile, version and port, runnable side by side.
- Version management: detect, install and remove dsh versions, then assign one to a launch entry.
- Plugins and packs: install, toggle and update plugins per environment; import and export `.dspack` files and browse the community market.
- MCP and skills: configure MCP servers and import, manage and toggle skills.
- Opening modes: browser tab, or a standalone browser window when Chrome, Chromium or Edge is installed.
- Also: light and dark themes, LAN binding, launch at login, recovery and log export.

## Updates

Settings → About → **Check for updates** queries npm for a newer version and shows the command:

```sh
npm install -g @melorise/dsh-x-core-standalone@latest
```

## Relationship to upstream

This repository is a standalone distribution branch of the [DSH-X](https://github.com/yyh-001/DSH-X) core and follows upstream. The differences are the `dsh-x` entry point, hiding shell-only controls when no shell is present, and checking for updates on npm. The Linux Chromium PATH fix lives on its own branch, `fix/linux-chromium-lookup`, for an upstream pull request.

## Development

Requires Node.js 22.18+.

```sh
npm install       # installs pnpm, used by plugin commands
npm start         # start the manager
npm test          # full test suite
node bin/dsh-x.mjs --no-open
```

## License

MIT. DSH-X is a community project, not an official DeepSeek product.
