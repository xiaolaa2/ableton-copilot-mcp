import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { ZodRawShape } from 'zod'
import { ErrorTypes, handleError } from '../error-handler.js'
import { ableton } from '../../ableton.js'
import { FactoryContainer } from '../core.js'
import { OperationStatus } from '../../entities/OperationHistory.js'
import { createOperationHistory, updateOperationHistoryById } from '../../utils/snapshot-utils.js'
import { logger } from '../../main.js'
import PerformanceMonitor from '../../utils/performance-monitor.js'

async function processToolReq(
    argsObj: object,
    originalFunc: (...args: any[]) => Promise<object>,
    toolName: string,
    enableSnapshot: boolean = false,
    skipAbletonCheck: boolean = false
): Promise<CallToolResult | Promise<CallToolResult>> {
    let historyId = null
    const startTime = performance.now()
    
    try {
        // Check Ableton connection status
        if (!skipAbletonCheck && !ableton.isConnected()) {
            throw ErrorTypes.ABLETON_ERROR('Ableton is not connected, please check if Ableton is running.')
        }

        // Create operation history record (if enabled)
        if (enableSnapshot) {
            historyId = await createOperationHistory({
                tool_name: toolName,
                input_params: JSON.stringify(argsObj),
                execution_result: '',
                status: OperationStatus.PENDING,
            })
        }

        // Execute original function
        const ans = await originalFunc({
            ...argsObj,
            ...(enableSnapshot ? { historyId } : {}),
        })

        // Update operation history record (if enabled)
        if (enableSnapshot && historyId) {
            await updateOperationHistoryById(historyId, {
                execution_result: JSON.stringify(ans),
                status: OperationStatus.SUCCESS,
            })
        }

        // Build response
        const response = enableSnapshot ? {
            history_id: historyId,
            result: ans
        } : ans

        // Record performance metrics
        const endTime = performance.now()
        PerformanceMonitor.instance.recordMetric(`tool:${toolName}`, endTime - startTime)
        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response),
                }
            ]
        }
    }
    catch (error) {
        // Update operation history record to failed (if enabled)
        if (enableSnapshot && historyId) {
            await updateOperationHistoryById(historyId, {
                execution_result: String(error),
                status: OperationStatus.FAILED,
            })
        }
        
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
    skipAbletonCheck?: boolean
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
                        return await processToolReq(args, originalFunc, toolName, options.enableSnapshot, options.skipAbletonCheck)
                    }
                )
            }
        }
        FactoryContainer.tools.push(func)
    }
}