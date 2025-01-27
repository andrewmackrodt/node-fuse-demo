import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { TestFileSystemAdapter } from './fuse/adapters/test/TestFileSystemAdapter'
import { FuseFileSystem } from './fuse/FuseFileSystem'
import { FuseError } from './fuse/utils/errors'

const basePath = path.dirname(__dirname)
const defaultMountPath = process.platform !== 'win32' ? `${basePath}/mnt` : 'Z:\\'
const mountPath = process.env.MOUNT_PATH || defaultMountPath

void (async function () {
    const fuse = new FuseFileSystem(mountPath, new TestFileSystemAdapter())

    // attempt to unmount the volume and exit
    if (process.argv.indexOf('--unmount') !== -1) {
        return await fuse.unmount()
    }

    // create mountPath if it is the default directory
    if (mountPath === defaultMountPath && !fs.existsSync(mountPath)) {
        try {
            fs.mkdirSync(mountPath)
        } catch {}
    }

    // optional file system mount options
    const options = ['default_permissions']
    if (os.platform() === 'darwin') {
        options.push('noappledouble', 'noapplexattr', `volname=${path.basename(mountPath)}`)
    }

    // mount the file system
    await fuse.mount(options)
})()
    .catch((err) => process.exit(err instanceof FuseError ? err.code : 1))
    .then(() => process.exit(0))
