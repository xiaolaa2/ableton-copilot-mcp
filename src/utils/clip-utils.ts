import { Clip } from 'ableton-js/ns/clip.js'
import { ableton } from '../ableton.js'
import { SnapshotType, Snapshot, NoteSnapshotData } from '../entities/Snapshot.js'
import { createSnapshot } from './snapshot-utils.js'

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
    return clip.removeNotesExtended(fromTime, fromPitch, timeSpan, pitchSpan)
}

export async function removeAllNotes(clip: Clip) {
    return removeNotesExtended(clip, 0, 127, 0, 9999)
}

export async function getAllNotes(clip: Clip) {
    const liveVersion = await ableton.application.get('major_version')
    if (liveVersion >= 11) {
        return clip.getNotesExtended(0, 0, 9999, 127)
    }
    return clip.getNotes(0, 0, 9999, 127)
}

export async function createNoteSnapshot(clip: Clip, historyId: number): Promise<number> {
    const data: NoteSnapshotData = {
        clip_id: clip.raw.id,
        notes: await getAllNotes(clip),
    }
    const snapshot = {
        history_id: historyId,
        snapshot_data: JSON.stringify(data),
        snapshot_type: SnapshotType.NOTE,
    } as Omit<Snapshot, 'id' | 'createdAt' | 'updatedAt'>
    return createSnapshot(snapshot)
}