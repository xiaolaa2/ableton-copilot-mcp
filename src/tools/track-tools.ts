import { z } from 'zod'
import { tool } from '../mcp/decorators/decorator.js'
import { commomProp, TrackSettableProp } from '../types/types.js'
import { Track } from 'ableton-js/ns/track.js'
import { modifyTrackProp } from '../utils/obj-utils.js'
import { getRawTrackById, getTrackById, Result } from '../utils/common.js'
import { Clip } from 'ableton-js/ns/clip.js'
import { ableton } from '../ableton.js'

class TrackTools {

    @tool({
        name: 'get_clips_by_track_id',
        description: 'get all clip by track id',
        paramsSchema: {
            track_id: z.string(),
        }
    })
    async getClipByTrack(track_id: string) {
        const track = getTrackById(track_id)
        const clips = await track.get('arrangement_clips')
        return clips.map((clip) => clip.raw)
    }

    @tool({
        name: 'get_track_info_by_id',
        description: 'get track info by id',
        paramsSchema: {
            track_id: z.string(),
        }
    })
    async getTrackInfo(track_id: string) {
        const track = getTrackById(track_id)
        return track.raw
    }

    @tool({
        name: 'create_empty_midi_clip',
        description: 'create empty midi clip on track',
        paramsSchema: {
            track_id: z.string(),
            length: z.number().describe('Length is given in beats and must be a greater value than 0.0.'),
            time: commomProp.time,
        }
    })
    async createEmptyMidiClip(track_id: string, length: number, time: number) {
        // Get track object
        const track = getTrackById(track_id)

        // Get all clip slots from the track
        const clipSlots = await track.get('clip_slots')
        const lastClipSlot = clipSlots.at(-1)

        // Check if there is an available clip slot
        if (!lastClipSlot) {
            throw new Error('No clip slot available')
        }

        // Check if last slot has clip, delete if exists
        const hasExistingClip = await lastClipSlot.get('has_clip')
        if (hasExistingClip) {
            await lastClipSlot.deleteClip()
        }

        // Create new empty MIDI clip
        await lastClipSlot.createClip(length)

        // Get newly created clip and duplicate to arrangement view
        const newlyCreatedClip = await lastClipSlot.get('clip')
        if (newlyCreatedClip) {
            await track.duplicateClipToArrangement(newlyCreatedClip, time) as Clip
            return Result.ok()
        }

        throw new Error('Failed to create MIDI clip')
    }

    @tool({
        name: 'set_track_property',
        description: 'set track property',
        paramsSchema: {
            track_id: z.string(),
            property: TrackSettableProp,
        }
    })
    async setTrackProperty(
        track_id: string,
        property: z.infer<typeof TrackSettableProp>
    ) {
        const raw_track = getRawTrackById(track_id)
        const track = new Track(ableton, raw_track)
        await modifyTrackProp(track, property)
        return Result.ok()
    }

    @tool({
        name: 'duplicate_clip_to_track',
        description: 'duplicate clip to track',
        paramsSchema: {
            clip_id: z.string(),
            track_id: z.string(),
            time: z.number(),
        }
    })
    async duplicateClipToTrack(clip_id: string, track_id: string, time: number) {
        const track = getTrackById(track_id)
        await track.duplicateClipToArrangement(clip_id, time)
        return Result.ok()
    }

    @tool({
        name: 'get_track_available_input_routings',
        description: 'get track available input routings',
        paramsSchema: {
            track_id: z.string(),
        }
    })
    async getTrackAvailableInputRoutings(track_id: string) {
        const track = getTrackById(track_id)
        const input_routings = await track.get('available_input_routing_types')
        return input_routings.map((routing) => routing.display_name)
    }
}

export default TrackTools