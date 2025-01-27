/* eslint-disable perfectionist/sort-classes */
/* eslint-disable perfectionist/sort-objects */
import colors from 'colors'

export enum LogLevel {
    FATAL,
    ERROR,
    WARN,
    INFO,
    DEBUG,
    TRACE,
}

const formatters = {
    [LogLevel.FATAL]: (text: string) => colors.bgRed(colors.black(text)),
    [LogLevel.ERROR]: colors.red,
    [LogLevel.WARN]: colors.yellow,
    [LogLevel.INFO]: colors.reset,
    [LogLevel.DEBUG]: colors.gray,
    [LogLevel.TRACE]: colors.gray,
}

export class Logger {
    public logLevel: LogLevel
    private readonly loggers: Record<string, Logger> = {}

    constructor(
        private readonly module: string,
        logLevel?: LogLevel,
    ) {
        this.logLevel = logLevel ?? LogLevel.INFO
    }

    getLogger(module: string, logLevel?: LogLevel): Logger {
        if (this.module !== 'root') {
            module = this.module + '.' + module
        }
        let logger: Logger
        if (module in this.loggers) {
            logger = this.loggers[module]
            if (typeof logLevel === 'number' && logLevel !== logger.logLevel) {
                logger.logLevel = logLevel
            }
        } else {
            logger = new Logger(module, logLevel ?? this.logLevel)
            this.loggers[module] = logger
        }
        return logger
    }

    fatal(message: string, ...params: unknown[]): void {
        this.log(LogLevel.FATAL, message, ...params)
    }

    error(message: string, ...params: unknown[]): void {
        this.log(LogLevel.ERROR, message, ...params)
    }

    warn(message: string, ...params: unknown[]): void {
        this.log(LogLevel.WARN, message, ...params)
    }

    info(message: string, ...params: unknown[]): void {
        this.log(LogLevel.INFO, message, ...params)
    }

    debug(message: string, ...params: unknown[]): void {
        this.log(LogLevel.DEBUG, message, ...params)
    }

    trace(message: string, ...params: unknown[]): void {
        this.log(LogLevel.TRACE, message, ...params)
    }

    protected log(level: LogLevel, message: string, ...params: unknown[]): void {
        if (level > this.logLevel) {
            return
        }

        const date = new Date()
        const dstr = date.toLocaleString('sv-SE') + '.' + date.getMilliseconds().toString().padStart(3, '0')
        const formatted = formatters[level](`${dstr} ${LogLevel[level]} ${this.module}: ${message}`)
        if (params.length > 0) {
            if (params[0] instanceof Error && level > LogLevel.ERROR && this.logLevel < LogLevel.DEBUG) {
                params.shift()
            }
            let i = 0
            params = params.map((param) => {
                if (i++ === 0 && param instanceof Error) {
                    if (!param.stack) {
                        return param
                    }
                    const stack = param.stack
                        .split('\n')
                        .slice(1)
                        .filter((str) => !str.includes('node:internal/'))
                    if (stack.length === 0) {
                        return param
                    }
                    return '\n' + formatters[level](stack.join('\n'))
                }
                if (typeof param === 'string') {
                    return formatters[level](param)
                } else {
                    return param
                }
            })
        }

        if (level < LogLevel.ERROR) {
            console.log(formatted, ...params)
        } else {
            console.error(formatted, ...params)
        }
    }
}

//region determine default log level
let logLevel = LogLevel.INFO

for (const arg of process.argv) {
    if (arg.startsWith('--log-level=')) {
        const level = arg.split('=')[1].toUpperCase() as keyof typeof LogLevel
        if (level in LogLevel) {
            logLevel = LogLevel[level]
        }
    } else if (['--verbose', '-v'].includes(arg)) {
        logLevel = LogLevel.DEBUG
    } else if (arg === '--trace') {
        logLevel = LogLevel.TRACE
    }
}
//endregion

export const rootLogger = new Logger('root', logLevel)
