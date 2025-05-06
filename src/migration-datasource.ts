import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { OperationHistory } from './entities/OperationHistory.js'
import { Snapshot } from './entities/Snapshot.js'
import path from 'path'
import os from 'os'

// Default database path, can be overridden with environment variables
const DB_PATH = process.env.DB_PATH || path.join(os.homedir(), '.ableton-copilot-mcp', 'data.db')

// This data source is used only for migrations
export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: DB_PATH,
    synchronize: false,
    logging: true, // Enable logging for migration operations
    entities: [OperationHistory, Snapshot],
    migrations: [path.join(process.cwd(), 'src/migrations/*.ts')],
    migrationsTableName: 'migrations_history',
})

// For CLI commands
export default AppDataSource 