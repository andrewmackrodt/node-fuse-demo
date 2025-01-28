import type { Stats as FileStat, FSStat, MountOptions, Stats } from 'node-fuse-bindings'
import type { FileSystemAdapter } from './FileSystemAdapter'
import type { Logger } from '../../logger'
import type { FuseFileSystem } from '../FuseFileSystem'
import { ErrorCodes } from '../utils/constants'
import { FuseError } from '../utils/errors'

const DESTROY_TIMEOUT_MILLIS = 5000

/**
 * The `FuseFileSystemAdapterProxy` class acts as a proxy that bridges operations between a
 * Fuse-based filesystem and a custom `FileSystemAdapter`. It implements the `MountOptions`
 * interface, enabling the interaction between a Fuse-based filesystem and the adapter while adding
 * additional behaviors such as logging and error handling.
 *
 * This proxy also wraps filesystem operations like `access`, `chmod`, `create`, etc. and handles
 * their execution through the provided adapter. It manages logging for debugging purposes and
 * provides a utility for error handling to standardize the way errors are propagated to callbacks.
 *
 * Constructing the `FuseFileSystemAdapterProxy` is done through the static `create` method, which
 * filters exposed methods that are not private or internal and binds them to an instance, ensuring
 * the necessary interface compatibility with `MountOptions`.
 *
 * Key responsibilities of this class include:
 *
 * - Bridging filesystem method calls to the adapter's implementation.
 * - Enhancing method calls with logging for debugging and visibility.
 * - Standardizing error handling and ensuring callbacks are invoked properly.
 * - Supporting operations such as access control, file creation, attribute management, extended
 *   attribute handling, directory synchronization, linking, and more.
 * - Managing filesystem lifecycle methods like `init` and `destroy`, with timeout handling for
 *   unmount scenarios.
 *
 * This proxy is designed to integrate with the Fuse library while still being abstracted enough to
 * adapt to varying implementations via the `FileSystemAdapter`.
 */
export class FuseFileSystemAdapterProxy implements MountOptions {
    private destroyTimerId?: NodeJS.Timeout

    protected constructor(
        private readonly fuse: FuseFileSystem,
        private readonly adapter: FileSystemAdapter,
        private readonly logger: Logger,
    ) {}

    public static create(fuse: FuseFileSystem, adapter: FileSystemAdapter, logger: Logger) {
        const instance = new this(fuse, adapter, logger)
        return Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
            .filter((key) => !key.startsWith('_'))
            .filter((key) => key !== 'constructor')
            .filter((key) => typeof (adapter as any)[key] === 'function' || ['init', 'destroy'].includes(key))
            .reduce(
                (result, key) => {
                    // @ts-expect-error key exists in both types
                    result[key] = instance[key].bind(instance)
                    return result
                },
                {} as Pick<MountOptions, keyof FileSystemAdapter>,
            )
    }

    async access(path: string, mode: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Checking access for path: ${path}, mode: ${mode}`)

        return await this.adapter.access!(path, mode)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async chmod(path: string, mode: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Changing mode for path: ${path} to mode: ${mode}`)

        return await this.adapter.chmod!(path, mode)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async chown(path: string, uid: number, gid: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Changing ownership for path: ${path} to uid: ${uid}, gid: ${gid}`)

        return await this.adapter.chown!(path, uid, gid)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async create(path: string, mode: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Creating file at path: ${path} with mode: ${mode}`)

        return await this.adapter.create!(path, mode)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async destroy(cb: (value: number) => void): Promise<void> {
        this.logger.info('Destroying filesystem...')

        if (!this.destroyTimerId) {
            // assume the volume has been unmounted externally if the destroy event is received and unmount has not
            // been called by the application itself after waiting for 5000 milliseconds
            this.destroyTimerId = setTimeout(() => {
                delete this.destroyTimerId
                if (!this.fuse.mounted) {
                    return
                }
                this.logger.warn('Filesystem destroy timeout, unmounting...')
                void this.fuse.unmount(true).catch(function () {})
            }, DESTROY_TIMEOUT_MILLIS)
        }

        if (this.adapter.destroy) {
            return await this.adapter.destroy!()
                .then(() => cb(0))
                .catch((err) => this._errorHandler(err, cb))
        } else {
            return cb(0)
        }
    }

    async fgetattr(path: string, fd: number, cb: (code: number, value?: FileStat) => void): Promise<void> {
        this.logger.debug(`Getting attributes for path: ${path} using fd: ${fd}`)

        return await this.adapter.fgetattr!(path, fd)
            .then((value) => cb(0, value))
            .catch((err) => this._errorHandler(err, cb))
    }

    async flush(path: string, fd: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Flushing file at path: ${path}, fd: ${fd}`)

        return await this.adapter.flush!(path, fd)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async fsync(path: string, fd: number, datasync: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Syncing file at path: ${path}, fd: ${fd}, datasync: ${datasync}`)

        return await this.adapter.fsync!(path, fd, datasync)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async fsyncdir(path: string, fd: number, datasync: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Syncing directory at path: ${path}, fd: ${fd}, datasync: ${datasync}`)

        return await this.adapter.fsyncdir!(path, fd, datasync)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async ftruncate(path: string, fd: number, size: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Truncating file by fd at path: ${path}, fd: ${fd} to size: ${size}`)

        return await this.adapter.ftruncate!(path, fd, size)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async getattr(path: string, cb: (code: number, stats?: Stats) => void): Promise<void> {
        this.logger.debug(`Getting attributes for path: ${path}`)

        return await this.adapter.getattr!(path)
            .then((stats) => cb(0, stats))
            .catch((err) => this._errorHandler(err, cb))
    }

    async getxattr(
        path: string,
        name: string,
        buffer: Buffer,
        length: number,
        offset: number,
        cb: (value: number) => void,
    ): Promise<void> {
        this.logger.debug(`Getting extended attribute with name: ${name} at path: ${path}`)

        return await this.adapter.getxattr!(path, name, buffer, length, offset)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async init(cb: (value: number) => void): Promise<void> {
        this.logger.info('Initializing filesystem...')
        if (this.adapter.init) {
            return await this.adapter.init!()
                .then(() => cb(0))
                .catch((err) => this._errorHandler(err, cb))
        } else {
            return cb(0)
        }
    }

    async link(src: string, dest: string, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Creating link from source path: ${src} to destination path: ${dest}`)

        return await this.adapter.link!(src, dest)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async listxattr(
        path: string,
        buffer: Buffer,
        length: number,
        cb: (code: number, value?: number) => void,
    ): Promise<void> {
        this.logger.debug(`Listing extended attributes at path: ${path}`)

        return await this.adapter.listxattr!(path, buffer, length)
            .then((value) => cb(0, value))
            .catch((err) => this._errorHandler(err, cb))
    }

    async mkdir(path: string, mode: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Creating directory at path: ${path} with mode: ${mode}`)

        return await this.adapter.mkdir!(path, mode)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async mknod(path: string, mode: number, dev: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Creating node at path: ${path} with mode: ${mode}, dev: ${dev}`)

        return await this.adapter.mknod!(path, mode, dev)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async open(path: string, flags: number, cb: (code: number, value?: number) => void): Promise<void> {
        this.logger.debug(`Opening file at path: ${path} with flags: ${flags}`)

        return await this.adapter.open!(path, flags)
            .then((value) => cb(0, value))
            .catch((err) => this._errorHandler(err, cb))
    }

    async opendir(path: string, flags: number, cb: (code: number, value?: number) => void): Promise<void> {
        this.logger.debug(`Opening directory at path: ${path} with flags: ${flags}`)

        return await this.adapter.opendir!(path, flags)
            .then((value) => cb(0, value))
            .catch((err) => this._errorHandler(err, cb))
    }

    async read(
        path: string,
        fd: number,
        buffer: Buffer,
        length: number,
        position: number,
        cb: (bytesRead: number) => void,
    ): Promise<void> {
        this.logger.debug(`Reading from file at path: ${path}, fd: ${fd}, position: ${position}`)

        return await this.adapter.read!(path, fd, buffer, length, position)
            .then(cb)
            .catch((err) => this._errorHandler(err, cb))
    }

    async readdir(path: string, cb: (code: number, value?: string[]) => void): Promise<void> {
        this.logger.debug(`Reading directory at path: ${path}`)

        return await this.adapter.readdir!(path)
            .then((value) => cb(0, value))
            .catch((err) => this._errorHandler(err, cb))
    }

    async readlink(path: string, cb: (code: number, value?: string) => void): Promise<void> {
        this.logger.debug(`Reading symlink at path: ${path}`)

        return await this.adapter.readlink!(path)
            .then((value) => cb(0, value))
            .catch((err) => this._errorHandler(err, cb))
    }

    async release(path: string, fd: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Releasing file at path: ${path}, fd: ${fd}`)

        return await this.adapter.release!(path, fd)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async releasedir(path: string, fd: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Releasing directory at path: ${path}, fd: ${fd}`)

        return await this.adapter.releasedir!(path, fd)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async removexattr(path: string, name: string, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Removing extended attribute with name: ${name} at path: ${path}`)

        return await this.adapter.removexattr!(path, name)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async rename(src: string, dest: string, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Renaming from source path: ${src} to destination path: ${dest}`)

        return await this.adapter.rename!(src, dest)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async rmdir(path: string, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Removing directory at path: ${path}`)

        return await this.adapter.rmdir!(path)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async setxattr(
        path: string,
        name: string,
        buffer: Buffer,
        length: number,
        offset: number,
        flags: number,
        cb: (value: number) => void,
    ): Promise<void> {
        this.logger.debug(`Setting extended attribute with name: ${name} at path: ${path}`)

        return await this.adapter.setxattr!(path, name, buffer, length, offset, flags)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async statfs(path: string, cb: (code: number, stat?: FSStat) => void): Promise<void> {
        this.logger.debug(`Getting filesystem stats for path: ${path}`)

        return await this.adapter.statfs!(path)
            .then((fsStat) => cb(0, fsStat))
            .catch((err) => this._errorHandler(err, cb))
    }

    async symlink(target: string, linkpath: string, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Creating symlink from target: ${target} to linkpath: ${linkpath}`)

        return await this.adapter.symlink!(target, linkpath)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async truncate(path: string, size: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Truncating file at path: ${path} to size: ${size}`)

        return await this.adapter.truncate!(path, size)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async unlink(path: string, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Deleting file at path: ${path}`)

        return await this.adapter.unlink!(path)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async utimens(path: string, atime: number, mtime: number, cb: (value: number) => void): Promise<void> {
        this.logger.debug(`Updating timestamps for path: ${path}, atime: ${atime}, mtime: ${mtime}`)

        return await this.adapter.utimens!(path, atime, mtime)
            .then(() => cb(0))
            .catch((err) => this._errorHandler(err, cb))
    }

    async write(
        path: string,
        fd: number,
        buffer: Buffer,
        length: number,
        position: number,
        cb: (bytesWritten: number) => void,
    ): Promise<void> {
        this.logger.debug(`Writing to file at path: ${path}, fd: ${fd}, position: ${position}`)

        return await this.adapter.write!(path, fd, buffer, length, position)
            .then(cb)
            .catch((err) => this._errorHandler(err, cb))
    }

    protected _errorHandler(err: Error | string, cb: (code: number) => void) {
        let code: number
        const message = err!.toString().replace(/^(Error: )+/, '') || 'undefined'
        if (err instanceof FuseError) {
            this.logger.warn(message, err)
            code = err.code
        } else {
            this.logger.error(`Error: unhandled exception during FUSE operation: ${message}`, err)
            code = ErrorCodes.EIO
        }
        cb(code)
    }
}
