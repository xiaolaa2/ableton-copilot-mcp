import { startServer as startMcp } from './mcp/core.js'
import { createLogger } from './utils/logger.js'
import path from 'path'
import { initAbleton } from './ableton.js'
import { initializeDataSource } from './db.js'
import os from 'os'
import BrowserTools from './tools/browser-tools.js'
import ClipTools from './tools/clip-tools.js'
import DeviceTools from './tools/device-tools.js'
import HistoryTools from './tools/history-tools.js'
import SongTools from './tools/song-tools.js'
import TrackTools from './tools/track-tools.js'
import PerformanceMonitor from './utils/performance-monitor.js'
import fs from 'fs'
import ExtraTools from './tools/extra-tools.js'
import ApplicationTools from './tools/application-tools.js'

// Set environment variables
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=4096'

// Configure base path
const basePath = process.env.BASE_PATH || path.join(os.homedir(), '.ableton-copilot-mcp')

const logFile = path.join(basePath, 'logs', 'ableton.log')
const dbFile = path.join(basePath, 'data.db')

export const logger = createLogger(logFile)

const logsDir = path.join(basePath, 'logs')
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
}

try {
    // Initialize database
    await initializeDataSource(dbFile)

    // Start MCP server
    await startMcp({
        // Register tool classes, make decorators available
        tools: [BrowserTools, ClipTools, DeviceTools, HistoryTools, SongTools, TrackTools, ExtraTools, ApplicationTools]
    })

    // Initialize Ableton connection
    await initAbleton(logger)
} catch (error) {
    logger.error('Error initializing Ableton Copilot MCP:', error)
}

// Set up performance monitoring timer
setInterval(() => {
    PerformanceMonitor.instance.logMetrics()
    // Reset metrics every hour
    if (new Date().getHours() % 1 === 0 && new Date().getMinutes() === 0) {
        logger.info('Resetting performance metrics')
        PerformanceMonitor.instance.resetMetrics()
    }
}, 60 * 60 * 1000) // Log every hour

logger.info('Ableton Copilot MCP initialized successfully')