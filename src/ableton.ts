import { Ableton } from 'ableton-js'
import { setupRecordModeListener } from './utils/record-utils.js'

export let ableton: Ableton

export async function initAbleton(logger: any) {
    ableton = new Ableton({ logger })

    // Establishes a connection with Live
    await ableton.start()

    setupRecordModeListener(ableton.song)
}