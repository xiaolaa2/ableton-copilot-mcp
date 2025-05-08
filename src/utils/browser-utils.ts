import { Browser } from 'ableton-js/ns/browser.js'
import { ableton } from '../ableton.js'
import { getBrowserItemById } from './obj-utils.js'
import { BrowserItem } from 'ableton-js/ns/browser-item.js'

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