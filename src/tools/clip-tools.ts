import { tool } from '../mcp/decorators/decorator.js'
import { ableton } from '../main.js'
import { z } from 'zod'
import { Note } from 'ableton-js/util/note.js'
import { NOTE, ClipSettableProp } from '../types/types.js'
import { modifyClipProp } from '../utils/obj-utils.js'
import { getClipById, Result } from '../utils/common.js'

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
        await clip.removeNotes(0, 0, 9999, 127)
        // this way can't work i don't know why
        // await detailClip.removeNotesExtended(0, 0, 9999, 127)
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
}

export default ClipTools
