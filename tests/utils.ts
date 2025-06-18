/**
 * Parse the result returned by MCP tool to extract the actual data content
 * @param mcpResult The original result returned by MCP tool
 * @returns The parsed data object
 */
export function parseMcpResult(mcpResult: any): any {
    if (!mcpResult || !mcpResult.content) {
        throw new Error('Invalid MCP result format')
    }

    // Process content array format
    if (Array.isArray(mcpResult.content)) {
        const textContent = mcpResult.content.find((item: any) => item.type === 'text')
        if (textContent && textContent.text) {
            const parsedData: any = JSON.parse(textContent.text)
            return parsedData.data || parsedData
        }
    }

    return mcpResult
}
