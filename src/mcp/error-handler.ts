import { logger } from '../main.js'

export interface ErrorResponse {
    code: string;
    message: string;
    details?: any;
}

export class ApiError extends Error {
    readonly code: string
    readonly statusCode: number
    readonly details?: any

    constructor(code: string, message: string, statusCode = 400, details?: any) {
        super(message)
        this.name = 'ApiError'
        this.code = code
        this.statusCode = statusCode
        this.details = details
    }

    toResponse(): ErrorResponse {
        const response: ErrorResponse = {
            code: this.code,
            message: this.message
        }

        if (this.details) {
            response.details = this.details
        }

        return response
    }
}

export function handleError(error: unknown): ErrorResponse {
    // Already an API error
    if (error instanceof ApiError) {
        logger.error(`API Error [${error.code}]: ${error.message}`, error.details || '')
        return error.toResponse()
    }

    // Regular Error object
    if (error instanceof Error) {
        logger.error(`Unexpected Error: ${error.message}`, error.stack || '')
        return {
            code: 'INTERNAL_ERROR',
            message: error.message
        }
    }

    // Other unknown type of error
    const errorString = String(error)
    logger.error(`Unknown Error Type: ${errorString}`)
    return {
        code: 'UNKNOWN_ERROR',
        message: errorString
    }
}

// Predefined common error types
export const ErrorTypes = {
    INVALID_ARGUMENT: (message: string, details?: any) =>
        new ApiError('INVALID_ARGUMENT', message, 400, details),

    NOT_FOUND: (message: string, details?: any) =>
        new ApiError('NOT_FOUND', message, 404, details),

    ABLETON_ERROR: (message: string, details?: any) =>
        new ApiError('ABLETON_ERROR', message, 500, details),

    INTERNAL_ERROR: (message: string, details?: any) =>
        new ApiError('INTERNAL_ERROR', message, 500, details),
}

// Set global uncaught exception handlers
process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION:', error)
})

process.on('unhandledRejection', (reason) => {
    logger.error('UNHANDLED REJECTION:', reason)
})