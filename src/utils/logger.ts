import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import fs from 'fs'

// Add DailyRotateFile plugin to winston transports
const { format } = winston
// Handle DailyRotateFile with type assertion
const DailyRotateFileTransport = DailyRotateFile as unknown as new (options: DailyRotateFile.DailyRotateFileTransportOptions)
    => winston.transport

// Create custom formatter to handle objects and multiple parameters
const objectFormat = format((info) => {
    // If message is an array (multiple parameters), join them
    if (Array.isArray(info.message)) {
        info.message = info.message.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
    }
    // If message is an object, convert to string
    else if (typeof info.message === 'object') {
        info.message = JSON.stringify(info.message)
    }
    return info
})

/**
 * Create a winston logger instance
 * @param logFilePath Path to the log file
 * @returns winston.Logger instance
 */
export function createLogger(logFilePath: string): winston.Logger {
    const logDir = path.dirname(logFilePath)
    const baseName = path.basename(logFilePath, path.extname(logFilePath))
    const ext = path.extname(logFilePath)

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    // Create daily rotate file transport
    const fileTransport = new DailyRotateFileTransport({
        filename: `${logDir}/${baseName}-%DATE%${ext}`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
    })

    // Create error log daily rotate transport
    const errorFileTransport = new DailyRotateFileTransport({
        filename: `${logDir}/${baseName}-error-%DATE%${ext}`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        zippedArchive: true
    })

    const logger = winston.createLogger({
        level: 'debug',
        format: format.combine(
            objectFormat(),
            format.timestamp({
                format: () => {
                    const now = new Date()
                    const year = now.getFullYear()
                    const month = String(now.getMonth() + 1).padStart(2, '0')
                    const day = String(now.getDate()).padStart(2, '0')
                    const hours = String(now.getHours()).padStart(2, '0')
                    const minutes = String(now.getMinutes()).padStart(2, '0')
                    const seconds = String(now.getSeconds()).padStart(2, '0')
                    const milliseconds = String(now.getMilliseconds()).padStart(3, '0')
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
                }
            }),
            format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] [${level.toUpperCase()}] ${message}`
            })
        ),
        transports: [
            fileTransport,
            errorFileTransport
        ]
    })

    // Wrap logger methods to handle multiple parameters
    const enhancedLogger = logger as winston.Logger & Record<string, any>

    // Wrap each log level method to support multiple parameters
    const wrapLogMethod = (method: string) => {
        const original = enhancedLogger[method].bind(enhancedLogger)
        enhancedLogger[method] = function (...args: any[]) {
            if (args.length > 1) {
                return original(args)
            } else {
                return original(args[0])
            }
        }
    }

    // Wrap all standard log levels
    ['error', 'warn', 'info', 'debug', 'verbose'].forEach(wrapLogMethod)

    return enhancedLogger as winston.Logger
}

// Export winston Logger type for use in other files
export type Logger = winston.Logger;