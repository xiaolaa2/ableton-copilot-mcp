import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { FactoryContainer } from './decorators/decorator.js'

export async function startServer() {

    const server = new McpServer({
        name: 'ableton-js-mcp',
        version: '0.0.1',
    }, {
        capabilities: {
            tools: {},
            // resources: {},
        }
    })

    // register all tools
    for (const factory of FactoryContainer.tools) {
        factory(server)
    }

    const transport = new StdioServerTransport()
    await server.connect(transport)
}