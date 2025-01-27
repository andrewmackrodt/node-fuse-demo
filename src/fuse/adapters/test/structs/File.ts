import type { Directory } from './Directory'
import type { NodeOptions } from './Node'
import { Node } from './Node'
import { S_IFREG } from '../../../utils/constants'

type FileOptions = Omit<NodeOptions, 'parent'> & {
    perm?: number
}

export class File extends Node {
    buffer = Buffer.from('')

    constructor(ino: number, name: string, parent: Directory, options: FileOptions = {}) {
        const mode = S_IFREG | (options?.perm ?? 0o644)
        super(ino, mode, name, { ...options, parent })
    }

    get size(): number {
        return this.buffer.length
    }
}
