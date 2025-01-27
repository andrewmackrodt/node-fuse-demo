import path from 'node:path'
import type { Directory } from './Directory'
import { FileStat } from '../../../structs/FileStat'

const DEFAULT_UID = process.getuid?.() ?? 0
const DEFAULT_GID = process.getgid?.() ?? 0

export interface NodeOptions {
    readonly atime?: number
    readonly blksize?: number
    readonly ctime?: number
    readonly dev?: number
    readonly gid?: number
    readonly mtime?: number
    readonly parent?: Directory
    readonly rdev?: number
    readonly uid?: number
}

export abstract class Node {
    readonly atime: number
    readonly blksize: number
    readonly ctime: number
    readonly dev: number
    readonly gid: number
    readonly mtime: number
    readonly parent?: Directory
    readonly rdev: number
    readonly uid: number

    protected constructor(
        readonly ino: number,
        readonly mode: number,
        readonly name: string,
        options: NodeOptions = {},
    ) {
        this.dev = options?.dev ?? 4096
        this.uid = options?.uid ?? DEFAULT_UID
        this.gid = options?.uid ?? DEFAULT_GID
        this.rdev = options?.rdev ?? 0
        this.atime = options?.atime ?? options?.mtime ?? options?.ctime ?? Date.now()
        this.mtime = options?.mtime ?? options?.ctime ?? options?.atime ?? this.atime
        this.ctime = options?.ctime ?? options?.mtime ?? options?.atime ?? this.mtime
        this.blksize = options?.blksize ?? 0
        this.parent = options?.parent
    }

    get blocks(): number {
        return this.size > 0 ? Math.ceil(this.size / 512) : 0
    }

    get nlink(): number {
        return 1
    }

    get path(): string {
        return this.parent ? path.join(this.parent.path, this.name) : this.name
    }

    abstract get size(): number

    get stat(): FileStat {
        return new FileStat(
            this.dev,
            this.ino,
            this.mode,
            this.nlink,
            this.uid,
            this.gid,
            this.rdev,
            this.size,
            this.blksize,
            this.blocks,
            this.ctime,
            this.mtime,
            this.atime,
        )
    }
}
