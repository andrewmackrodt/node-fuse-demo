import { ErrorCodes } from './constants'

export class FuseError extends Error {
    constructor(
        readonly code: ErrorCodes,
        readonly description?: string,
    ) {
        super(description ? `${ErrorCodes[code]}: ${description}` : `${ErrorCodes[code]}`)
    }

    get name() {
        return this.constructor.name
    }
}

export class IllegalOperationOnDirectoryError extends FuseError {
    constructor(readonly file: string) {
        super(ErrorCodes.EISDIR, `illegal operation on a directory: ${file}`)
    }
}

export class NotADirectoryError extends FuseError {
    constructor(readonly file: string) {
        super(ErrorCodes.ENOTDIR, `not a directory: ${file}`)
    }
}

export class NoSuchFileOrDirectoryError extends FuseError {
    constructor(readonly file: string) {
        super(ErrorCodes.ENOENT, `no such file or directory: ${file}`)
    }
}

export class NotImplementedError extends FuseError {
    constructor(readonly method: string) {
        super(ErrorCodes.ENOSYS, `function not implemented: ${method}`)
    }
}

export class PermissionDeniedError extends FuseError {
    constructor(readonly file: string) {
        super(ErrorCodes.EACCES, `permission denied: ${file}`)
    }
}
