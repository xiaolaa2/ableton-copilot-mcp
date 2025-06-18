import { beforeAll, afterAll } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { parseMcpResult } from './utils'

class McpClient {
    client: Client
    transport: StdioClientTransport
    constructor() {
        this.client = new Client({ name: 'ableton-copilot-mcp', version: '0.0.1' })
        this.transport = new StdioClientTransport({
            // node executable path
            command: 'npx',
            args: ['-y', '@xiaolaa2/ableton-copilot-mcp'],
        })
    }

    public async ping() {
        await this.client.ping()
    }

    public async connect() {
        await this.client.connect(this.transport)
    }

    public async close() {
        await this.client.close()
    }

    public async callTool(name: string, params: Record<string, any>) {
        const response = await this.client.callTool({ name, arguments: params })
        return parseMcpResult(response)
    }

    public getClient() {
        return this.client
    }
}

let mcpClient: McpClient | null = null

// Global test setup
beforeAll(async () => {
    try {
        console.info('Setting up test environment...')

        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 100))
        mcpClient = new McpClient()
        await mcpClient.connect()

        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
        console.error('Failed to setup test environment:', error)
        throw error
    }
})

afterAll(async () => {
    await mcpClient?.close()
})

export { mcpClient }