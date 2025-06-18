import { describe, it, expect, beforeAll } from 'vitest'
import { mcpClient } from '../setup'

describe('Ableton Integration Tests', () => {

    let client: typeof mcpClient

    beforeAll(() => {
        client = mcpClient
        if (!client) {
            throw new Error('MCP client not initialized')
        }
    })

    it('should have initialized MCP Client', () => {
        expect(client).toBeDefined()
        expect(client).not.toBeNull()
    })

    it('should be able to connect to MCP Client', async () => {
        await client!.ping()
    })

    it('should be able to access song properties', async () => {
        const response = await client?.callTool('get_song_properties', {
            tempo: true
        })

        expect(response).toBeDefined()
        expect(response).not.toBeNull()
        expect(response).toHaveProperty('tempo')

        console.info(`Current song tempo: ${response.tempo}`)

        expect(response.tempo).toBeTypeOf('number')
    })
})