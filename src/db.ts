import 'reflect-metadata'
import { DataSource, Logger as TypeOrmLogger, LoggerOptions } from 'typeorm'
import { OperationHistory } from './entities/OperationHistory.js'
import { Snapshot } from './entities/Snapshot.js'
import { logger } from './main.js'
import path from 'path'
import { createBackup, ensureMigrationsDir, isFirstRun } from './utils/migration-helper.js'

let AppDataSource: DataSource | null = null
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second delay

// 根据环境设置 TypeORM 日志级别
const isProd = process.env.NODE_ENV === 'production'
const typeormLogging = isProd
    ? ['error', 'warn', 'migration']
    : ['query', 'error', 'schema', 'warn', 'info', 'log', 'migration']

class TypeOrmLoggerAdapter implements TypeOrmLogger {
    logQuery(query: string, parameters?: any[]) {
        logger.debug(`[typeorm][query] ${query}${parameters && parameters.length ? ' -- ' + JSON.stringify(parameters) : ''}`)
    }
    logQueryError(error: string | Error, query: string, parameters?: any[]) {
        logger.error(`[typeorm][query-error] ${query}${parameters && parameters.length ? ' -- ' + JSON.stringify(parameters) : ''} -- ${error}`)
    }
    logQuerySlow(time: number, query: string, parameters?: any[]) {
        logger.warn(`[typeorm][slow-query][${time}ms] ${query}${parameters && parameters.length ? ' -- ' + JSON.stringify(parameters) : ''}`)
    }
    logSchemaBuild(message: string) {
        logger.info(`[typeorm][schema] ${message}`)
    }
    logMigration(message: string) {
        logger.info(`[typeorm][migration] ${message}`)
    }
    log(level: 'log' | 'info' | 'warn', message: any) {
        if (level === 'log' || level === 'info') {
            logger.info(`[typeorm][${level}] ${message}`)
        } else if (level === 'warn') {
            logger.warn(`[typeorm][warn] ${message}`)
        }
    }
}

export async function initializeDataSource(dbPath: string): Promise<void> {
    if (AppDataSource && AppDataSource.isInitialized) {
        logger.info('Data Source has already been initialized!')
        return
    }

    logger.info(`Initializing Data Source with database path: ${dbPath}`)

    // Check if this is the first run with the new migration system
    const firstRun = isFirstRun(dbPath)

    // Ensure migrations directory exists and get its path
    const migrationsDir = ensureMigrationsDir()

    AppDataSource = new DataSource({
        type: 'sqljs',
        location: dbPath,
        autoSave: true,
        useLocalForage: false,
        // On first run, we can use synchronize to create tables
        // After that, migrations will handle schema changes
        synchronize: firstRun,
        logging: typeormLogging as LoggerOptions,
        logger: new TypeOrmLoggerAdapter(),
        entities: [OperationHistory, Snapshot],
        // Use the migrations directory path returned by ensureMigrationsDir
        migrations: [path.join(migrationsDir, '*.js')],
        migrationsTableName: 'migrations',
        // Set to false, we will manually control the migration process
        migrationsRun: false,
    })

    let retries = 0

    while (retries < MAX_RETRIES) {
        try {
            await AppDataSource.initialize()

            // Only execute migrations and create backups when needed
            if (!firstRun) {
                // Debug - print migrations table content
                try {
                    const migrationRows = await AppDataSource.query('SELECT * FROM migrations')
                    logger.info(`Current migrations in DB: ${JSON.stringify(migrationRows)}`)
                } catch (err) {
                    logger.warn('Could not query migrations table:', err)
                }

                // Check if there are pending migrations
                // showMigrations() returns true if there are pending migrations
                const hasPendingMigrations = await AppDataSource.showMigrations()
                logger.info(`Has pending migrations: ${hasPendingMigrations}`)

                // If there are pending migrations, create backup and run migrations
                if (hasPendingMigrations) {
                    logger.info('Pending migrations detected, creating backup...')
                    createBackup(dbPath)

                    logger.info('Running migrations...')
                    const migrations = await AppDataSource.runMigrations()
                    logger.info(`Executed ${migrations.length} migrations`)
                } else {
                    logger.info('No pending migrations, skipping backup and migration')
                }
            }

            logger.info('Data Source has been initialized successfully!')
            logger.info(`Database initialized with ${firstRun ? 'synchronize mode' : 'migrations mode'}`)
            return
        } catch (err) {
            retries++

            if (retries >= MAX_RETRIES) {
                logger.error('Failed to initialize Data Source after maximum retries:', err)
                throw err
            }

            logger.warn(`Data Source initialization failed, retrying (${retries}/${MAX_RETRIES})...`)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        }
    }
}

export function getDataSource(): DataSource {
    if (!AppDataSource || !AppDataSource.isInitialized) {
        throw new Error('Data Source is not initialized')
    }
    return AppDataSource
}

export function getOperationHistoryRepository() {
    return getDataSource().getRepository(OperationHistory)
}

export function getSnapshotRepository() {
    return getDataSource().getRepository(Snapshot)
}