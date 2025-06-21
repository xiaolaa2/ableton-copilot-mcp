import { Clip } from 'ableton-js/ns/clip.js'
import { ableton } from '../ableton.js'
import { SnapshotType, Snapshot, NoteSnapshotData } from '../entities/Snapshot.js'
import { createSnapshot } from './snapshot-utils.js'
import { Note, NoteExtended } from 'ableton-js/util/note.js'
import { NoteExtendedToNote } from './obj-utils.js'
import { ErrorTypes } from '../mcp/error-handler.js'

export async function removeNotesExtended(
    clip: Clip,
    fromPitch: number,
    pitchSpan: number,
    fromTime: number,
    timeSpan: number
) {
    const abltonMajorVersion = await ableton.application.get('major_version', true)
    if (abltonMajorVersion < 11) {
        return clip.removeNotes(fromTime, fromPitch, timeSpan, pitchSpan)
    }
    return clip.removeNotesExtended(fromTime, fromPitch, timeSpan, pitchSpan)
}

export async function removeAllNotes(clip: Clip) {
    return removeNotesExtended(clip, 0, 127, 0, 9999)
}

export async function getAllNotes(clip: Clip) {
    const liveVersion = await ableton.application.get('major_version', true)
    if (liveVersion >= 11) {
        return clip.getNotesExtended(0, 0, 9999, 127)
    }
    return clip.getNotes(0, 0, 9999, 127)
}

export async function getNotes(clip: Clip, fromPitch: number, pitchSpan: number, fromTime: number, timeSpan: number) {
    const liveVersion = await ableton.application.get('major_version', true)
    if (liveVersion >= 11) {
        return clip.getNotesExtended(fromTime, fromPitch, timeSpan, pitchSpan)
    }
    return clip.getNotes(fromTime, fromPitch, timeSpan, pitchSpan)
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

// only use for replace_clip_notes and rollback_by_history_id
export async function setNotesExtended(clip: Clip, notes: NoteExtended[]) {
    const noteToSet = notes.map(note => NoteExtendedToNote(note))
    // throw new Error(`note: ${noteToSet.map(note => JSON.stringify(note))}`)

    await clip.setNotes(noteToSet)
    const getNotes = await getAllNotes(clip)
    if (getNotes.length !== notes.length) {
        throw ErrorTypes.INTERNAL_ERROR('setNotesExtended failed')
    }
    notes.forEach((note, index) => {
        note.note_id = (getNotes[index] as NoteExtended).note_id
    })
    await clip.applyNoteModifications(notes)
}

export async function replaceClipNotes(clip: Clip, notes: Note[]) {
    await removeAllNotes(clip)
    await clip.setNotes(notes)
}

// only apply note modifications if live version is 11
export async function replaceClipNotesExtended(clip: Clip, notes: NoteExtended[]) {
    await removeAllNotes(clip)
    await setNotesExtended(clip, notes)
}
