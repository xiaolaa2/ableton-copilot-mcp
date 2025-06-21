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
            command: 'yarn',
            args: ['run', 'dev'],
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
        const result = parseMcpResult(response)
        if (response.isError) {
            throw new Error(JSON.stringify(result))
        }
        return result
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