import { z } from 'zod'
import { logger } from '../main.js'
import { ErrorTypes } from '../mcp/error-handler.js'
import { installAbletonJsScripts } from './install-scripts.js'

/**
 * Result class for operation outcomes
 */
export class Result {
    static ok(): string {
        return 'ok'
    }

    static error(message: string): { error: string } {
        return { error: message }
    }

    static data<T>(data: T): { data: T } {
        return { data }
    }
}

/**
 * Create a Zod schema
 * @param props Properties object
 * @returns Zod schema
 */
export function createZodSchema<T>(props: {
    [K in keyof T]?: z.ZodTypeAny
}) {
    return z
        .object(props as z.ZodRawShape)
        .partial()
}

/**
 * Copy midi-scripts from ableton-js library to Ableton Live's MIDI Remote Scripts folder
 */
export function initAbletonJs() {
    try {
        installAbletonJsScripts(logger)
    } catch (error: unknown) {
        logger.error(error instanceof Error ? error.message : String(error))
        throw ErrorTypes.INTERNAL_ERROR('init ableton-js error')
    }
}

export function getLocalDate(): Date {
    const localTime = new Date().toLocaleString(undefined, {
        hour12: false
    }).replace(/\//g, '-').replace(',', '')
    return new Date(localTime)
}

