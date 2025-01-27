import type { Stats as IFileStat } from 'node-fuse-bindings'
import * as constants from '../utils/constants'

export class FileStat implements IFileStat {
    constructor(
        public readonly dev: number,
        public readonly ino: number,
        public readonly mode: number,
        public readonly nlink: number,
        public readonly uid: number,
        public readonly gid: number,
        public readonly rdev: number,
        public readonly size: number,
        public readonly blksize: number,
        public readonly blocks: number,
        public readonly ctimeMs: number,
        public readonly mtimeMs: number,
        public readonly atimeMs: number,
    ) {}

    get atime() {
        return new Date(this.atimeMs)
    }

    get birthtime() {
        return new Date(this.birthtimeMs)
    }

    get birthtimeMs() {
        return this.ctimeMs
    }

    get ctime() {
        return new Date(this.ctimeMs)
    }

    get mtime() {
        return new Date(this.mtimeMs)
    }

    isBlockDevice(): boolean {
        return Boolean(this.mode & constants.S_IFBLK)
    }

    isCharacterDevice(): boolean {
        return Boolean(this.mode & constants.S_IFCHR)
    }

    isDirectory(): boolean {
        return Boolean(this.mode & constants.S_IFDIR)
    }
    isFIFO(): boolean {
        return Boolean(this.mode & constants.S_IFIFO)
    }

    isFile(): boolean {
        return Boolean(this.mode & constants.S_IFREG)
    }

    isSocket(): boolean {
        return Boolean(this.mode & constants.S_IFSOCK)
    }

    isSymbolicLink(): boolean {
        return Boolean(this.mode & constants.S_IFLNK)
    }
}
