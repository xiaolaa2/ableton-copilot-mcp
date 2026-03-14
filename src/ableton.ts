import { Ableton } from 'ableton-js'
import { setupRecordModeListener } from './utils/record-utils.js'

export let ableton: Ableton

export async function initAbleton(logger: any) {
    ableton = new Ableton({ 
        logger,
        heartbeatInterval: 5000,
        commandTimeoutMs: 5000,
    })

    // Establishes a connection with Live
    await ableton.start()

    setupRecordModeListener(ableton.song)
}