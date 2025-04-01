import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { ZodRawShape } from 'zod'
import { handleException } from '../error-handler.js'
import { ableton } from '../../ableton.js'

type ToolFactory = (server: McpServer) => void

// Container for all decorators
export const FactoryContainer: {
    tools: ToolFactory[]
} = {
    tools: [],
}

async function processToolReq(
    argsObj: object,
    originalFunc: (...args: any[]) => object
): Promise<CallToolResult | Promise<CallToolResult>> {
    try {
        if (!ableton.isConnected()) {
            throw new Error('Ableton is not connected, please check if Ableton is running.')
        }
        const args = argsObj ? Object.values(argsObj) : []
        // @todo: 根据传进来的类型定义来调整参数顺序
        const ans = await originalFunc(...args)
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
        return handleException(error as Error)
    }
}

/**
 * Decorator for registering a tool with the server.
 */
export function tool(options?: {
    name?: string,
    description?: string,
    paramsSchema?: ZodRawShape
}) {
    return function (_: object, propertyKey: string, descriptor: PropertyDescriptor) {
        let func
        const originalFunc = descriptor.value
        if (!options) {
            func = function (server: McpServer) {
                server.tool(
                    propertyKey,
                    async (args) => {
                        return await processToolReq(args, originalFunc)
                    }
                )
            }
        } else {
            func = function (server: McpServer) {
                server.tool(
                    options.name ?? propertyKey,
                    options.description ?? '',
                    options.paramsSchema ?? {},
                    async (args) => {
                        return await processToolReq(args, originalFunc)
                    }
                )
            }
        }
        FactoryContainer.tools.push(func)
    }
}