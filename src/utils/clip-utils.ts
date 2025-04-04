import { Clip } from 'ableton-js/ns/clip.js'
import { ableton } from '../ableton.js'

export async function removeNotesExtended(
    clip: Clip,
    fromPitch: number,
    pitchSpan: number,
    fromTime: number,
    timeSpan: number
) {
    const abltonMajorVersion = await ableton.application.get('major_version')
    if (abltonMajorVersion < 11) {
        return clip.removeNotes(fromTime, fromPitch, timeSpan, pitchSpan)
    }
    return clip.sendCommand('remove_notes_extended', [
        fromPitch,
        pitchSpan,
        fromTime,
        timeSpan,
    ])
}

export async function removeAllNotes(clip: Clip) {
    return removeNotesExtended(clip, 0, 127, 0, 9999)
}