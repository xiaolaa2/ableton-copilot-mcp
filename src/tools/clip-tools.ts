import { tool } from '../mcp/decorators/tool.js'
import { z } from 'zod'
import { Note, NoteExtended } from 'ableton-js/util/note.js'
import { NOTE, ClipSettableProp, ClipGettableProp, NOTE_EXTENED } from '../types/zod-types.js'
import { batchModifyClipProp, getClipProps } from '../utils/obj-utils.js'
import { Result } from '../utils/common.js'
import { getClipById } from '../utils/obj-utils.js'
import { createNoteSnapshot, removeNotesExtended } from '../utils/clip-utils.js'

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
            note_ids: z.array(z.number()).describe('note ids, get from get_clip_notes')
        }
    })
    async removeClipNotesById({ clip_id, note_ids }: { clip_id: string, note_ids: number[] }) {
        const clip = getClipById(clip_id)
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
    async modifyClipNotes({ notes, clip_id }: { notes: NoteExtended[], clip_id: string }) {
        const clip = getClipById(clip_id)
        await clip.applyNoteModifications(notes)
        return Result.ok()
    }

    @tool({
        name: 'replace_all_notes_to_clip',
        description: 'Replace clip all notes by clip id',
        enableSnapshot: true,
        paramsSchema: {
            notes: z.array(NOTE).describe('[array] the notes to remove.'),
            clip_id: z.string()
        }
    })
    async replaceAllDetailClipNotes({ notes, clip_id, historyId }: { notes: Note[], clip_id: string, historyId: number }) {
        const clip = getClipById(clip_id)
        await createNoteSnapshot(clip, historyId)
        await clip.selectAllNotes()
        await clip.replaceSelectedNotes(notes)
        return Result.ok()
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
