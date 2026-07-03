import { Browser } from 'ableton-js/ns/browser'
import { ableton } from '../ableton.js'
import { getBrowserItemById } from './obj-utils.js'
import { BrowserItem } from 'ableton-js/ns/browser-item'

export enum ResourceType {
    AUDIO_EFFECTS = 'audio_effects',
    INSTRUMENTS = 'instruments',
    PLUGINS = 'plugins',
    DRUMS = 'drums',
    SAMPLES = 'samples',
    MIDI_EFFECTS = 'midi_effects',
    SOUNDS = 'sounds',
}

export async function loadDevice(deviceId: string, trackId?: string) {
    const item = getBrowserItemById(deviceId)
    const browser = new Browser(ableton)
    // select track
    if (trackId) {
        const songView = ableton.song.view
        await songView.set('selected_track', trackId)
        // `browser.loadItem()` always loads into whichever track is currently
        // selected in Live, not the track we just asked for. If something else
        // (another tool call, or the user clicking around in the Live UI) changes
        // the selection between the set above and loadItem() below, the device
        // silently lands on the wrong track with no error. Read the selection back
        // (bypassing the cache, since we need Live's true current state) and bail
        // out loudly instead of loading blind.
        const selectedTrack = await songView.get('selected_track', false)
        if (!selectedTrack || selectedTrack.raw.id !== trackId) {
            throw new Error(
                `Failed to load device: track selection changed before the device could be loaded. ` +
                    `Expected track "${trackId}" to be selected, but the currently selected track is ` +
                    `"${selectedTrack?.raw.id ?? 'none'}". The device was not loaded.`
            )
        }
    }
    await browser.loadItem(item)
}

async function getItemsRecursively(items: BrowserItem[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {}
    for (const item of items) {
        if (item.raw.is_folder) {
            const children = await item.get('children')
            result[item.raw.name] = await getItemsRecursively(children)
        } else {
            result[item.raw.name] = item.raw
        }
    }
    return result
}

export async function listResources(type: ResourceType) {
    const browser = new Browser(ableton)
    const items = await browser.get(type)
    return await getItemsRecursively(items)
}