import type { MountOptions } from 'node-fuse-bindings'
import fuse from 'node-fuse-bindings'
import { rootLogger } from '../logger'
import type { FileSystemAdapter } from './adapters/FileSystemAdapter'
import { FuseFileSystemAdapterProxy } from './adapters/FuseFileSystemAdapterProxy'
import { defer } from './utils'

const logger = rootLogger.getLogger('FuseFileSystem')

interface AsyncTask {
    wait: () => Promise<void>
}

export class FuseFileSystem {
    private _mounted = false
    private sigIntHandler?: () => void
    private unmountDeferred?: ReturnType<typeof defer<void>>

    constructor(
        protected readonly mountPoint: string,
        protected readonly adapter: FileSystemAdapter,
    ) {}

    get mounted(): boolean {
        return this._mounted
    }

    /**
     * Mounts the filesystem using the provided options. Awaiting the returned promise will wait
     * until the volume is unmounted. If you want the event loop to continue after mounting is
     * complete, you should use `mountAsync` instead.
     *
     * @param {string[]} [options=[]] - An array of options to configure the mount operation.
     *   Default is `[]`
     *
     * @returns {Promise<void>} - A promise that will resolve when the volume is unmounted.
     */
    async mount(options: string[] = []): Promise<void> {
        const { wait } = await this.mountAsync(options)
        return await wait()
    }

    /**
     * Asynchronously mounts the filesystem with the provided options.
     *
     * @param {string[]} [options=[]] - An array of string options to configure the mount operation.
     *   Default is `[]`
     *
     * @returns {Promise<AsyncTask>} A promise that resolves to an `AsyncTask` object which contains
     *   a method `wait` that will resolve when the volume is unmounted.
     */
    async mountAsync(options: string[] = []): Promise<AsyncTask> {
        const { promise: mounted, reject, resolve } = defer<void>()
        const ops: MountOptions = {
            options,
            ...FuseFileSystemAdapterProxy.create(this, this.adapter, logger),
        }
        fuse.mount(this.mountPoint, ops, (err) => {
            if (!err) {
                logger.info('mount success')
                this._mounted = true
                this.sigIntHandler = async () => {
                    if (this.sigIntHandler) {
                        process.removeListener('SIGINT', this.sigIntHandler)
                        delete this.sigIntHandler
                    }
                    await this.unmount(true).catch(function () {})
                }
                process.addListener('SIGINT', this.sigIntHandler)
                resolve()
            } else {
                const message = err.toString().replace(/^(Error: )+/, '') || 'undefined'
                logger.error(`mount error: ${message}`)
                reject()
            }
        })
        await mounted
        this.unmountDeferred = defer<void>()
        const unmountedPromise = this.unmountDeferred.promise
        return { wait: () => unmountedPromise }
    }

    /**
     * Unmounts the file system mounted at the specified mount point. Optionally, a force flag can
     * be provided to force promise rejection for the wait handler returned by `mountAsync`.
     *
     * @param {boolean} [force] - If true, calls reject on the wait handler returned by
     *   `mountAsync`.
     *
     * @returns {Promise<void>} A promise that resolves upon successful unmount or rejects if the
     *   unmount operation fails.
     */
    async unmount(force?: boolean): Promise<void> {
        const { promise: unmounted, reject, resolve } = defer<void>()
        fuse.unmount(this.mountPoint, (err) => {
            if (!err) {
                logger.info('unmount success')
                if (this.sigIntHandler) {
                    process.removeListener('SIGINT', this.sigIntHandler)
                    delete this.sigIntHandler
                }
                this.unmountDeferred?.resolve()
                delete this.unmountDeferred
                this._mounted = false
                resolve()
            } else {
                const message = err.toString().replace(/^(Error: )+/, '') || 'undefined'
                logger.error(`unmount error: ${message}`)
                if (force) {
                    this.unmountDeferred?.reject()
                    delete this.unmountDeferred
                    this._mounted = false
                }
                reject()
            }
        })
        return await unmounted
    }
}
