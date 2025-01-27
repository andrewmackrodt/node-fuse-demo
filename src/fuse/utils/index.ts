import { S_IFBLK, S_IFCHR, S_IFDIR, S_IFIFO, S_IFLNK, S_IFREG, S_IFSOCK } from './constants'

export function defer<T>() {
    let resolve: (value: T | PromiseLike<T>) => void
    let reject: (reason?: any) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, reject: reject!, resolve: resolve! }
}

//region file mode
export function fifo(mode: number): number
export function fifo(owner: number, group: number, other: number): number
export function fifo(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFIFO | (owner << 6) | (group! << 3) | other! : S_IFIFO | owner
}

export function char(mode: number): number
export function char(owner: number, group: number, other: number): number
export function char(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFCHR | (owner << 6) | (group! << 3) | other! : S_IFCHR | owner
}

export function directory(mode: number): number
export function directory(owner: number, group: number, other: number): number
export function directory(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFDIR | (owner << 6) | (group! << 3) | other! : S_IFDIR | owner
}

export function block(mode: number): number
export function block(owner: number, group: number, other: number): number
export function block(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFBLK | (owner << 6) | (group! << 3) | other! : S_IFBLK | owner
}

export function file(mode: number): number
export function file(owner: number, group: number, other: number): number
export function file(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFREG | (owner << 6) | (group! << 3) | other! : S_IFREG | owner
}

export function link(mode: number): number
export function link(owner: number, group: number, other: number): number
export function link(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFLNK | (owner << 6) | (group! << 3) | other! : S_IFLNK | owner
}

export function socket(mode: number): number
export function socket(owner: number, group: number, other: number): number
export function socket(owner: number, group?: number, other?: number) {
    return arguments.length === 3 ? S_IFSOCK | (owner << 6) | (group! << 3) | other! : S_IFSOCK | owner
}
//endregion
