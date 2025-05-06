import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { ZodRawShape } from 'zod'
import { ErrorTypes, handleError } from '../error-handler.js'
import { ableton } from '../../ableton.js'
import { FactoryContainer } from '../core.js'
import { logger } from '../../main.js'
import PerformanceMonitor from '../../utils/performance-monitor.js'

async function processToolReq(
    argsObj: object,
    originalFunc: (...args: any[]) => Promise<object>,
    toolName: string
): Promise<CallToolResult | Promise<CallToolResult>> {
    const startTime = performance.now()
    
    try {
        // Check Ableton connection status
        if (!ableton.isConnected()) {
            throw ErrorTypes.ABLETON_ERROR('Ableton is not connected, please check if Ableton is running.')
        }

        // Execute original function
        const ans = await originalFunc({
            ...argsObj,
        })
        // Record performance metrics
        const endTime = performance.now()
        PerformanceMonitor.instance.recordMetric(`tool:${toolName}`, endTime - startTime)
        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(ans),
                }
            ]
        }
    }
    catch (error) {
        
        // Record performance metrics (error case)
        const endTime = performance.now()
        PerformanceMonitor.instance.recordMetric(`tool:${toolName}:error`, endTime - startTime)
        
        // Handle error and return standardized response
        const errorResponse = handleError(error)
        logger.error(`Tool execution error [${toolName}]:`, errorResponse)
        
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(errorResponse),
                }
            ]
        }
    }
}

/**
 * Decorator for registering a tool with the server.
 */
export function tool(options?: {
    name?: string,
    description?: string,
    enableSnapshot?: boolean, // Enable snapshot mode - when enabled, operation records will be saved and historyId will be passed to the function for snapshot creation
    paramsSchema?: ZodRawShape
}) {
    return function (_: object, propertyKey: string, descriptor: PropertyDescriptor) {
        let func
        const originalFunc = descriptor.value
        if (!options) {
            const toolName = propertyKey
            func = function (server: McpServer) {
                server.tool(
                    toolName,
                    async (args) => {
                        return await processToolReq(args, originalFunc, toolName)
                    }
                )
            }
        } else {
            func = function (server: McpServer) {
                const toolName = options.name ?? propertyKey
                server.tool(
                    toolName,
                    options.description ?? '',
                    options.paramsSchema ?? {},
                    async (args) => {
                        return await processToolReq(args, originalFunc, toolName)
                    }
                )
            }
        }
        FactoryContainer.tools.push(func)
    }
}