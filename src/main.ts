import { startServer as startMcp } from './mcp/core.js'
import { createLogger } from './utils/logger.js'
import path from 'path'
import './tools/init.js'
import { initAbleton } from './ableton.js'

const logFile = path.join(process.cwd(), 'logs', 'ableton.log')
export const logger = createLogger(logFile)

await startMcp()
await initAbleton(logger)