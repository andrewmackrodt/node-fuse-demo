import path from 'node:path'
import type { File } from './File'
import { Node, type NodeOptions } from './Node'
import { S_IFDIR } from '../../../utils/constants'
import { NoSuchFileOrDirectoryError } from '../../../utils/errors'

type DirectoryOptions = NodeOptions & {
    perm?: number
}

export class Directory extends Node {
    readonly files = new Map<string, Directory | File>()

    constructor(ino: number, name: string, options: DirectoryOptions = {}) {
        const mode = S_IFDIR | (options?.perm ?? 0o755)
        super(ino, mode, name, options)
    }

    get nlink(): number {
        return 2 + this.files.size
    }

    get size(): number {
        return 1024
    }

    find(file: string): Directory | File {
        let directoryOrFile: Directory | File = this
        for (const name of file.split(path.sep)) {
            if (name !== '') {
                if (!(directoryOrFile instanceof Directory) || !directoryOrFile.files.has(name)) {
                    throw new NoSuchFileOrDirectoryError(file)
                }
                directoryOrFile = directoryOrFile.files.get(name)!
            }
        }
        if (directoryOrFile.path !== file) {
            throw new NoSuchFileOrDirectoryError(file)
        }
        return directoryOrFile
    }

    public listFiles(): string[] {
        return Array.from(this.files.keys())
    }
}
