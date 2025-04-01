import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { logger } from '../main.js'

export function handleException(error: Error): CallToolResult {
    logger.error((error as Error).toString())
    return {
        isError: true,
        content: [
            {
                type: 'text',
                text: (error as Error).toString(),
            }
        ]
    }
}