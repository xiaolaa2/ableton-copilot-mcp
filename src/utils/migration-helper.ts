import { DataSource } from 'typeorm'
import { logger } from '../main.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Check if this is the first run with the new migration system
 * @param dbPath Path to the database file
 * @returns true if this is the first run, false otherwise
 */
export function isFirstRun(dbPath: string): boolean {
    try {
        // Check if the database file exists
        return !fs.existsSync(dbPath)
    } catch (error) {
        logger.error('Error checking if database exists:', error)
        return false
    }
}

/**
 * Verify that migrations table exists
 * @param dataSource The TypeORM data source
 * @returns Promise resolving to true if migrations table exists
 */
export async function verifyMigrationsTable(dataSource: DataSource): Promise<boolean> {
    try {
        const tableExists = await dataSource.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='migrations'
        `)
        
        return tableExists.length > 0
    } catch (error) {
        logger.error('Error verifying migrations table:', error)
        return false
    }
}

/**
 * Create a backup of the database before migration
 * @param dbPath Path to the database file
 */
export function createBackup(dbPath: string): void {
    try {
        if (fs.existsSync(dbPath)) {
            const backupPath = `${dbPath}.bak.${Date.now()}`
            fs.copyFileSync(dbPath, backupPath)
            logger.info(`Database backup created at ${backupPath}`)
        }
    } catch (error) {
        logger.error('Error creating database backup:', error)
    }
}

/**
 * Check if a directory contains migration files
 * @param dir Directory to check
 * @returns true if directory contains JS migration files
 */
function directoryHasMigrations(dir: string): boolean {
    try {
        if (!fs.existsSync(dir)) return false
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))
        logger.info(`Directory ${dir} contains ${files.length} migration files: ${files.join(', ')}`)
        return files.length > 0
    } catch (error) {
        logger.warn(`Error checking directory ${dir} for migrations:`, error)
        return false
    }
}

/**
 * Ensure migrations directory exists and return its path
 * @returns Path to the migrations directory
 */
export function ensureMigrationsDir(): string {
    // Get current script path (works in ESM)
    const currentFilePath = fileURLToPath(import.meta.url)
    logger.info(`Current script path: ${currentFilePath}`)
    
    // Calculate migrations directory path relative to this script
    // This script is in src/utils or dist/utils, so we need to go up two levels
    const scriptDir = path.dirname(currentFilePath)
    const projectRoot = path.dirname(path.dirname(scriptDir))
    
    // The migrations directory should be in dist/migrations
    const migrationsDir = path.join(projectRoot, 'dist', 'migrations')
    logger.info(`Looking for migrations in: ${migrationsDir}`)
    
    // Check if directory exists and has migrations
    if (directoryHasMigrations(migrationsDir)) {
        logger.info(`Using migrations directory at ${migrationsDir}`)
        return migrationsDir
    }
    
    // If directory doesn't exist, create it
    if (!fs.existsSync(migrationsDir)) {
        try {
            fs.mkdirSync(migrationsDir, { recursive: true })
            logger.info(`Created migrations directory at ${migrationsDir}`)
        } catch (error) {
            logger.warn(`Could not create migrations directory at ${migrationsDir}:`, error)
        }
    }
    
    return migrationsDir
} 