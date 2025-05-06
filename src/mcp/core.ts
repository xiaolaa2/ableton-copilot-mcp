import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { logger } from '../main.js'

type ToolFactory = (server: McpServer) => void

export class FactoryContainer {
    private static _tools: ToolFactory[] = []

    static get tools() {
        return this._tools
    }
}

export async function startServer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prop: {
        tools: any[]
    }
) {
    try {
        const server = new McpServer({
            name: 'ableton-copilot-mcp',
            version: '0.0.1',
        }, {
            capabilities: {
                tools: {},
                resources: {},
            }
        })

        // Register all tools
        const startTime = performance.now()
        let registeredCount = 0
        
        for (const factory of FactoryContainer.tools) {
            try {
                factory(server)
                registeredCount++
            } catch (error) {
                logger.error(`Failed to register tool: ${error instanceof Error ? error.message : String(error)}`)
            }
        }
        
        const endTime = performance.now()
        logger.info(`Successfully registered ${registeredCount} tools in ${(endTime - startTime).toFixed(2)}ms`)

        const transport = new StdioServerTransport()
        await server.connect(transport)
        logger.info('MCP server started successfully')
    } catch (error) {
        logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`)
        throw error
    }
}