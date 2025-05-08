import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'
import { createRequire } from 'module'

export interface Logger {
    warn: (message: string) => void;
    debug: (message: string) => void;
    error: (message: string | unknown) => void;
}

export function createConsoleLogger(): Logger {
    return {
        warn: (message) => console.warn(message),
        debug: (message) => console.debug(message),
        error: (message) => console.error(message instanceof Error ? message.message : String(message))
    }
}

/**
 * Recursively copy a folder
 */
function copyFolderSync(source: string, target: string) {
    // Create target folder if it doesn't exist
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true })
    }

    // Read all items from source folder
    const items = fs.readdirSync(source)

    // Copy each item
    for (const item of items) {
        const sourcePath = path.join(source, item)
        const targetPath = path.join(target, item)

        // Check if it's a file or folder
        const stat = fs.statSync(sourcePath)

        if (stat.isFile()) {
            fs.copyFileSync(sourcePath, targetPath)
        } else if (stat.isDirectory()) {
            copyFolderSync(sourcePath, targetPath)
        }
    }
}

/**
 * Copy midi-scripts from ableton-js library to Ableton Live's MIDI Remote Scripts folder
 * @param logger Optional logger to use, defaults to console logger
 */
export function installAbletonJsScripts(logger?: Logger) {
    const log = logger || createConsoleLogger()
    // Use createRequire to get the ableton-js module path
    const require = createRequire(import.meta.url)
    let abletonJSPath = ''

    try {
        // Try to resolve the ableton-js module path
        const abletonJsMainPath = require.resolve('ableton-js')
        // Get the directory of node_modules/ableton-js
        const abletonJsDir = path.dirname(abletonJsMainPath)
        // Get the path to the midi-script folder
        abletonJSPath = path.join(abletonJsDir, 'midi-script')

        // Verify the path exists
        if (!fs.existsSync(abletonJSPath)) {
            throw new Error(`ableton-js midi-script folder not found: ${abletonJSPath}`)
        }
    } catch (resolveError) {
        // Fall back to relative path method
        log.warn(`Failed to resolve ableton-js using require.resolve: ${resolveError instanceof Error ? resolveError.message : String(resolveError)}`)
        log.warn('Falling back to relative path method')

        const currentFilePath = fileURLToPath(import.meta.url)
        abletonJSPath = path.join(path.dirname(currentFilePath), '../../node_modules/ableton-js/midi-script')

        if (!fs.existsSync(abletonJSPath)) {
            throw new Error(`ableton-js midi-script folder not found in fallback location: ${abletonJSPath}`)
        }
    }

    // Determine User Library path based on operating system
    const username = os.userInfo().username
    let userLibraryPath = ''

    if (process.platform === 'win32') {
        userLibraryPath = path.join('C:', 'Users', username, 'Documents', 'Ableton', 'User Library')
    } else if (process.platform === 'darwin') {
        userLibraryPath = path.join('/Users', username, 'Music', 'Ableton', 'User Library')
    } else {
        throw new Error('Unsupported operating system')
    }

    // Create Remote Scripts folder (if it doesn't exist)
    const remoteScriptsPath = path.join(userLibraryPath, 'Remote Scripts')
    const abletonJSTargetPath = path.join(remoteScriptsPath, 'AbletonJS')

    if (!fs.existsSync(remoteScriptsPath)) {
        fs.mkdirSync(remoteScriptsPath, { recursive: true })
    }

    // If target folder exists, delete it first
    if (fs.existsSync(abletonJSTargetPath)) {
        fs.rmSync(abletonJSTargetPath, { recursive: true, force: true })
    }

    // Copy ableton-js midi-script to target path
    if (typeof fs.cpSync === 'function') {
        // Use Node.js v16.7.0+ cpSync
        fs.cpSync(abletonJSPath, abletonJSTargetPath, { recursive: true })
    } else {
        // Compatible with older Node.js versions
        copyFolderSync(abletonJSPath, abletonJSTargetPath)
    }

    log.debug(`AbletonJS scripts installed successfully.Source: ${abletonJSPath} Target: ${abletonJSTargetPath}`)

} 