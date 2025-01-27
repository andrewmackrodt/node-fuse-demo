# node-fuse-demo

Node.js Filesystem in Userspace (FUSE) Demo.

This project uses native bindings provided by [node-fuse-bindings](https://www.npmjs.com/package/node-fuse-bindings)
and provides patches to enable Node 20 compatibility.

## Requirements

**Operating System**: 🍏 macOS or 🐧 Linux. 🪟 Windows has not been tested but may work with [Dokan](https://github.com/dokan-dev/dokany).

**Runtime:** Node 20+, pnpm

**Additional Packages:** libfuse

### macOS

**These instructions assume the use of Homebrew. MacPorts users should adapt commands as appropriate.**

- Refer [How to Install macFUSE](https://github.com/macfuse/macfuse/wiki/Getting-Started#how-to-install-macfuse) to install and configure **macFUSE**
- Install **Xcode Command Line Tools**: `xcode-select --install`
- Install **pkgconf**: `brew install pkgconf`

### Linux

**These instructions are for **Ubuntu 22.04**. Non-debian users should adapt commands as appropriate. Required Packages:**

- libfuse2
- libfuse-dev
- pkg-config

**From a terminal execute:**

```sh
sudo apt install libfuse2 libfuse-dev pkg-config
```

### Windows

**Windows has not been tested. WSL2 should work for mounting volumes within the WSL filesystem. Alternatively, native
Windows compatibility may be poassible using [Dokan](https://github.com/dokan-dev/dokany).**

## Installation

- **Refer to the platform specific instructions under [Requirements](#requirements) before proceeding.**
- Clone the repository and open a terminal in the project directory.
- Ensure Node 20+ and pnpm are available. If Node is not installed or less than the required version, you can run
`./setup.sh` which will download a compatible runtime using [nvm](https://github.com/nvm-sh/nvm#about).
- Run `pnpm install` to download package dependencies.

## Usage

Run `pnpm start` to start the application, the FUSE volume is mounted on `./mnt`. If the application crashes or fails to
unmount the volume on exit, try running: `pnpm unmount`.

The default log level is `INFO`. The log level can be configured by providing the parameter `--log-level=`, e.g.
`pnpm start --log-level=TRACE`.

### Additional Commands

| Command             | Description                                      |
|---------------------|--------------------------------------------------|
| `pnpm build`        | Compile the application to JS (path: `./dist`)   |
| `pnpm build:check`  | Check for type errors                            |
| `pnpm check`        | Run all `*:check` commands                       |
| `pnpm clean`        | Remove files created by the `build` command      |
| `pnpm format`       | Run Prettier and format code                     |
| `pnpm format:check` | Check for Prettier errors                        |
| `pnpm lint`         | Run ESLint and attempt fixes (includes Prettier) |
| `pnpm lint:check`   | Check for ESLint errors (includes Prettier)      |
| `pnpm start`        | Start the application                            |
| `pnpm unmount`      | Attempt to unmount the volume                    |

## References

**node-fuse-demo** is loosely based on [pinkiesky/node-fuse-images](https://github.com/pinkiesky/node-fuse-images) and
its companion write-up: [Building a Dynamic Filesystem with FUSE and Node.js: A Practical Approach](https://dev.to/pinkiesky/building-a-dynamic-filesystem-with-fuse-and-nodejs-a-practical-approach-2ogo).
