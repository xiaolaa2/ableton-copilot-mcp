import { startServer as startMcp } from './mcp/core.js'
import { Ableton } from 'ableton-js'
import { createLogger } from './utils/logger.js'
import path from 'path'
import './tools/init.js'

const logFile = path.join(process.cwd(), 'logs', 'ableton.log')
export const logger = createLogger(logFile)

await startMcp()

const ableton = new Ableton({ logger })
// Establishes a connection with Live
await ableton.start()

export { ableton }