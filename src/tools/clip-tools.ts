import { tool } from '../mcp/decorators/decorator.js'
import { z } from 'zod'
import { Note } from 'ableton-js/util/note.js'
import { NOTE, ClipSettableProp } from '../types/types.js'
import { modifyClipProp } from '../utils/obj-utils.js'
import { getClipById, Result } from '../utils/common.js'
import { ableton } from '../ableton.js'
import { removeAllNotes } from '../utils/clip-utils.js'

async function getDetailClip() {
    const detailClip = await ableton.song.view.get('detail_clip')
    if (detailClip === null || detailClip === undefined) {
        throw new Error('please open piano roll')
    }
    return detailClip
}

class ClipTools {

    @tool({
        name: 'get_detail_clip',
        description: 'Get detail clip/piano roll clip',
    })
    async getDetailClip() {
        const detailClip = await getDetailClip()
        return detailClip.raw
    }

    @tool({
        name: 'get_clip_info_by_id',
        description: 'Get clip info by clip id',
        paramsSchema: {
            clip_id: z.string()
        }
    })
    async getClipInfoById(clip_id: string) {
        const clip = getClipById(clip_id)
        return clip.raw
    }

    @tool({
        name: 'get_all_notes_by_clipid',
        description: 'Get clip all notes by clip id',
        paramsSchema: {
            clip_id: z.string()
        }
    })
    async getClipNotes(clip_id: string) {
        const clip = getClipById(clip_id)
        return clip.getNotes(0, 0, 9999, 127)
    }

    @tool({
        name: 'remove_clip_all_notes',
        description: 'Remove clip all notes by clip id',
        paramsSchema: {
            clip_id: z.string()
        }
    })
    async removeALlClipNotes(clip_id: string) {
        const clip = getClipById(clip_id)
        await removeAllNotes(clip)
        return Result.ok()
    }

    @tool({
        name: 'add_notes_to_clip',
        description: 'Add notes to clip by clip id',
        paramsSchema: {
            notes: z.array(NOTE).describe('[array] the notes to add.'),
            clip_id: z.string()
        }
    })
    async addClipNotes(notes: Note[], clip_id: string) {
        const clip = getClipById(clip_id)
        await clip.setNotes(notes)
        return Result.ok()
    }

    @tool({
        name: 'replace_all_notes_to_clip',
        description: 'Replace clip all notes by clip id',
        paramsSchema: {
            notes: z.array(NOTE).describe('[array] the notes to remove.'),
            clip_id: z.string()
        }
    })
    async replaceAllDetailClipNotes(notes: Note[], clip_id: string) {
        const clip = getClipById(clip_id)
        await clip.selectAllNotes()
        await clip.replaceSelectedNotes(notes)
        return Result.ok()
    }

    @tool({
        name: 'set_clip_property',
        description: 'set clip property',
        paramsSchema: {
            clip_id: z.string(),
            property: ClipSettableProp,
        }
    })
    async setClipProperty(
        clip_id: string,
        property: z.infer<typeof ClipSettableProp>
    ) {
        const clip = getClipById(clip_id)
        await modifyClipProp(clip, property)
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
    async cropClip(clip_id: string) {
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
    async duplicateLoop(clip_id: string) {
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
    async duplicateRegion(
        clip_id: string,
        region_start: number,
        region_end: number,
        destination_time: number,
        pitch: number,
        transposition_amount: number
    ) {
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
