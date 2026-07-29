import { tool } from '../mcp/decorators/tool.js'
import { z } from 'zod'
import { Note, NoteExtended } from 'ableton-js/util/note'
import { NOTE, ClipSettableProp, ClipGettableProp, NOTE_EXTENED } from '../types/zod-types.js'
import { batchModifyClipProp, getClipProps, NoteToNoteExtended } from '../utils/obj-utils.js'
import { Result } from '../utils/common.js'
import { getClipById } from '../utils/obj-utils.js'
import { createNoteSnapshot, getNotes, removeNotesExtended, replaceClipNotesExtended } from '../utils/clip-utils.js'
import { ableton } from '../ableton.js'

const NOTE_FIELD_ABBREVIATIONS: Record<string, string> = {
    note_id: 'id',
    pitch: 'p',
    start_time: 't',
    duration: 'd',
    velocity: 'v',
    mute: 'm',
    probability: 'pr',
    release_velocity: 'rv',
    velocity_deviation: 'vd'
}

function abbreviateNoteFields(note: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(note)) {
        const abbrevKey = NOTE_FIELD_ABBREVIATIONS[key] || key
        result[abbrevKey] = value
    }
    return result
}

class ClipTools {

    @tool({
        name: 'get_clip_properties',
        description: 'Get clip properties by clip id. To get specific properties, set the corresponding property name to true in the properties parameter.',
        paramsSchema: {
            clip_id: z.string(),
            properties: ClipGettableProp,
        }
    })
    async getClipInfoById({ clip_id, properties }: { clip_id: string, properties: z.infer<typeof ClipGettableProp> }) {
        const clip = getClipById(clip_id)
        return await getClipProps(clip, properties)
    }

    @tool({
        name: 'get_clip_notes',
        description: `Get clip notes by clip id. Returns NoteExtended array for Live 11+ and Note array for Live 10 and below.

Field abbreviations in returned data:
- id: note_id
- p: pitch (MIDI note 0-127, 60=C3)
- t: start_time (beats)
- d: duration (beats)
- v: velocity (0-127)
- m: mute (boolean)
- pr: probability (0-1, Live 11+)
- rv: release_velocity (Live 11+)
- vd: velocity_deviation (Live 11+)`,
        paramsSchema: {
            clip_id: z.string(),
            from_pitch: z.number().min(0).max(127),
            from_time: z.number(),
            time_span: z.number(),
            pitch_span: z.number(),
        }
    })
    async getClipNotes({ clip_id, from_pitch, from_time, time_span, pitch_span }: { clip_id: string, from_pitch: number, from_time: number, time_span: number, pitch_span: number }) {
        const clip = getClipById(clip_id)
        const notes = await getNotes(clip, from_pitch, pitch_span, from_time, time_span)
        const abbreviatedNotes = notes.map(abbreviateNoteFields)
        return Result.data(abbreviatedNotes)
    }

    @tool({
        name: 'remove_clip_notes',
        description: 'Remove clip notes by clip id',
        enableSnapshot: true,
        paramsSchema: {
            clip_id: z.string(),
            from_pitch: z.number().min(0).max(127),
            pitch_span: z.number().describe('The number of semitones to remove. Must be a value greater than 0.'),
            from_time: z.number(),
            time_span: z.number().describe('The number of beats to remove. Must be a value greater than 0.'),
        }
    })
    async removeClipNotes({ clip_id, from_pitch, pitch_span, from_time, time_span, historyId }: {
        clip_id: string
        from_pitch: number
        pitch_span: number
        from_time: number
        time_span: number
        historyId: number
    }) {
        const clip = getClipById(clip_id)
        await createNoteSnapshot(clip, historyId)
        await removeNotesExtended(clip, from_pitch, pitch_span, from_time, time_span)
        return Result.ok()
    }

    @tool({
        name: 'remove_notes_by_ids',
        description: 'Remove notes by clip id and note ids',
        enableSnapshot: true,
        paramsSchema: {
            clip_id: z.string(),
            note_ids: z.array(z.number()).describe('note ids, get from get_clip_notes'),
        }
    })
    async removeClipNotesById({ clip_id, note_ids, historyId }: { clip_id: string, note_ids: number[], historyId: number }) {
        const clip = getClipById(clip_id)
        await createNoteSnapshot(clip, historyId)
        await clip.removeNotesById(note_ids)
        return Result.ok()
    }

    @tool({
        name: 'add_notes_to_clip',
        description: 'Add notes to clip by clip id',
        enableSnapshot: true,
        paramsSchema: {
            notes: z.array(NOTE).describe('[array] the notes to add.'),
            clip_id: z.string()
        }
    })
    async addClipNotes({ notes, clip_id, historyId }: { notes: Note[], clip_id: string, historyId: number }) {
        const clip = getClipById(clip_id)
        await createNoteSnapshot(clip, historyId)
        await clip.setNotes(notes)
        return Result.ok()
    }

    @tool({
        name: 'modify_clip_notes',
        description: 'Modify clip notes by clip id',
        enableSnapshot: true,
        paramsSchema: {
            notes: z.array(NOTE_EXTENED).describe('[array] the notes to modify.'),
            clip_id: z.string()
        }
    })
    async modifyClipNotes({ notes, clip_id, historyId }: { notes: NoteExtended[], clip_id: string, historyId: number }) {
        const clip = getClipById(clip_id)
        await createNoteSnapshot(clip, historyId)
        await clip.applyNoteModifications(notes)
        return Result.ok()
    }

    @tool({
        name: 'replace_clip_notes',
        description: 'Replace all notes in the clip with new notes',
        enableSnapshot: true,
        paramsSchema: {
            clip_id: z.string(),
            notes: z.array(NOTE).optional().describe('[array] The new notes to replace existing notes with'),
            notes_extended: z.array(NOTE_EXTENED).optional().describe('[array] Extended note data (Live 11+ only)')
        }
    })
    async replaceClipNotes({ notes, clip_id, historyId, notes_extended }: {
        notes: Note[],
        clip_id: string,
        historyId: number,
        notes_extended: NoteExtended[]
    }) {
        const clip = getClipById(clip_id)
        await createNoteSnapshot(clip, historyId)

        const liveVersion = await ableton.application.get('major_version', true)

        if (liveVersion >= 11) {
            let noteToSet: NoteExtended[] = []
            // Live 11+ supports extended notes and setNotesExtended
            if (notes_extended && notes_extended.length > 0) {
                noteToSet = notes_extended
            } else {
                // Convert basic notes to extended format for Live 11+
                noteToSet = notes.map(note => NoteToNoteExtended(note))
            }
            await replaceClipNotesExtended(clip, noteToSet)
        } else {
            if (notes_extended && notes_extended.length > 0) {
                throw new Error('Live 10 and below does not support extended notes')
            }
            // Live 10 and below: use legacy API
            await clip.selectAllNotes()
            await clip.replaceSelectedNotes(notes)
        }

        return Result.ok()
    }

    @tool({
        name: 'write_notes_to_clips',
        description: `Batch-write notes to multiple clips in one call instead of one add_notes_to_clip/replace_clip_notes
round-trip per clip. mode: 'add' (default) mirrors add_notes_to_clip; mode: 'replace' mirrors replace_clip_notes. Each
entry is isolated - one bad clip_id or write failure doesn't fail the rest of the batch. Note: unlike the single-clip
tools, batch writes don't create an undo snapshot per clip.`,
        paramsSchema: {
            writes: z.array(z.object({
                clip_id: z.string(),
                notes: z.array(NOTE),
                mode: z.enum(['add', 'replace']).optional().default('add'),
            }))
        }
    })
    async writeNotesToClips({ writes }: { writes: { clip_id: string, notes: Note[], mode?: 'add' | 'replace' }[] }) {
        const results = await Promise.all(writes.map(async ({ clip_id, notes, mode = 'add' }) => {
            try {
                const clip = getClipById(clip_id)
                if (mode === 'replace') {
                    const liveVersion = await ableton.application.get('major_version', true)
                    if (liveVersion >= 11) {
                        await replaceClipNotesExtended(clip, notes.map(note => NoteToNoteExtended(note)))
                    } else {
                        await clip.selectAllNotes()
                        await clip.replaceSelectedNotes(notes)
                    }
                } else {
                    await clip.setNotes(notes)
                }
                return { clip_id, status: 'ok' as const }
            } catch (error) {
                return { clip_id, status: 'error' as const, error: error instanceof Error ? error.message : String(error) }
            }
        }))
        return Result.data(results)
    }

    @tool({
        name: 'read_notes_from_clips',
        description: `Batch-read all notes from multiple clips in one call instead of looping get_clip_notes. Always
reads the whole clip (no from_pitch/from_time/time_span/pitch_span filtering). Each entry is isolated - one bad clip_id
doesn't fail the rest of the batch.`,
        paramsSchema: {
            clip_ids: z.array(z.string()),
        }
    })
    async readNotesFromClips({ clip_ids }: { clip_ids: string[] }) {
        const results = await Promise.all(clip_ids.map(async (clip_id) => {
            try {
                const clip = getClipById(clip_id)
                const notes = await getNotes(clip, 0, 128, 0, 99999999999999)
                return { clip_id, status: 'ok' as const, notes: notes.map(abbreviateNoteFields) }
            } catch (error) {
                return { clip_id, status: 'error' as const, error: error instanceof Error ? error.message : String(error) }
            }
        }))
        return Result.data(results)
    }

    @tool({
        name: 'set_clips_property',
        description: 'batch set clip property',
        paramsSchema: {
            clips: z.array(z.object({
                clip_id: z.string(),
                property: ClipSettableProp,
            }))
        }
    })
    async setClipProperty({ clips }: { clips: { clip_id: string, property: z.infer<typeof ClipSettableProp> }[] }) {
        await batchModifyClipProp(clips)
        return Result.ok()
    }

    @tool({
        name: 'crop_clip',
        description: `Crops the clip. The region that is cropped depends on whether the clip is looped or not. 
            If looped, the region outside of the loop is removed. If not looped, 
            the region outside the start and end markers is removed.`,
        paramsSchema: {
            clip_id: z.string(),
        }
    })
    async cropClip({ clip_id }: { clip_id: string }) {
        const clip = getClipById(clip_id)
        await clip.crop()
        return Result.ok()
    }

    @tool({
        name: 'duplicate_clip_loop',
        description: `Makes the loop twice as long and duplicates notes and envelopes. 
        Duplicates the clip start/end range if the clip is not looped.`,
        paramsSchema: {
            clip_id: z.string(),
        }
    })
    async duplicateLoop({ clip_id }: { clip_id: string }) {
        const clip = getClipById(clip_id)
        await clip.duplicateLoop()
        return Result.ok()
    }

    @tool({
        name: 'duplicate_clip_region',
        description: `Duplicates the notes in the specified region to the destination_time.
            Only notes of the specified pitch are duplicated if pitch is not -1.
            If the transposition_amount is not 0, the notes in the region will be
            transposed by the transposition_amount of semitones.
            Raises an error on audio clips..`,
        paramsSchema: {
            clip_id: z.string(),
            region_start: z.number(),
            region_end: z.number(),
            destination_time: z.number(),
            pitch: z.number(),
            transposition_amount: z.number(),
        }
    })
    async duplicateRegion({ clip_id, region_start, region_end, destination_time, pitch, transposition_amount }: {
        clip_id: string,
        region_start: number,
        region_end: number,
        destination_time: number,
        pitch: number,
        transposition_amount: number
    }) {
        const clip = getClipById(clip_id)
        await clip.duplicateRegion(
            region_start,
            region_end,
            destination_time,
            pitch,
            transposition_amount
        )
        return Result.ok()
    }
}

export default ClipTools
