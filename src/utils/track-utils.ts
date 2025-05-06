import { Clip } from 'ableton-js/ns/clip.js'
import { Track } from 'ableton-js/ns/track.js'

export function deleteClip(track: Track, clipOrId: Clip | string) {
    const clipId = typeof clipOrId === 'string' ? clipOrId : clipOrId.raw.id
    return track.sendCommand('delete_clip', {
        clip_id: clipId,
    })
}

export function deleteDevice(track: Track, index: number) {
    return track.sendCommand('delete_device', [index])
}

export function createAudioClip(track: Track, filePath: string, position: number) {
    return track.sendCommand('create_audio_clip', [filePath, position])
}