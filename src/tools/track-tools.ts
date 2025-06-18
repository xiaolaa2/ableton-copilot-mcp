import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { commomProp, TrackGettableProps, TrackSettableProp } from '../types/zod-types.js'
import { batchModifyTrackProp, getTrackProps } from '../utils/obj-utils.js'
import { Result } from '../utils/common.js'
import { getTrackById } from '../utils/obj-utils.js'

class TrackTools {

    @tool({
        name: 'get_track_properties',
        description: 'get track properties. To get specific properties, set the corresponding property name to true in the properties parameter',
        paramsSchema: {
            track_id: z.string(),
            properties: TrackGettableProps,
        }
    }) async getTracksProperty({ track_id, properties }: { track_id: string, properties: z.infer<typeof TrackGettableProps> }) {
        const track = getTrackById(track_id)
        return await getTrackProps(track, properties)
    }

    @tool({
        name: 'create_midi_clip',
        description: 'Creates an empty MIDI clip on the track and returns the created clip information',
        paramsSchema: {
            track_id: z.string(),
            length: z.number().describe('Length is given in beats and must be a greater value than 0.0.'),
            time: commomProp.time,
        }
    })
    async createEmptyMidiClip({ track_id, length, time }: { track_id: string, length: number, time: number }) {
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
            const clip = await track.duplicateClipToArrangement(newlyCreatedClip, time)
            return Result.data(clip.raw)
        }

        throw new Error('Failed to create MIDI clip')
    }

    @tool({
        name: 'set_tracks_property',
        description: 'batch set tracks property',
        paramsSchema: {
            tracks: z.array(z.object({
                track_id: z.string().describe('get track id by get_all_tracks'),
                property: TrackSettableProp,
            }))
        }
    })
    async setTracksProperty({ tracks }: { tracks: { track_id: string, property: z.infer<typeof TrackSettableProp> }[] }) {
        await batchModifyTrackProp(tracks)
        return Result.ok()
    }

    @tool({
        name: 'duplicate_clip_to_track',
        description: 'duplicate clip to track and return the duplicated clip information',
        paramsSchema: {
            clip_id: z.string(),
            track_id: z.string(),
            time: z.number(),
        }
    })
    async duplicateClipToTrack({ clip_id, track_id, time }: { clip_id: string, track_id: string, time: number }) {
        const track = getTrackById(track_id)
        const clip = await track.duplicateClipToArrangement(clip_id, time)
        return Result.data(clip.raw)
    }

    @tool({
        name: 'delete_clip',
        description: 'delete clip by id',
        paramsSchema: {
            track_id: z.string(),
            clip_id: z.string(),
        }
    })
    async deleteClipById({ track_id, clip_id }: { track_id: string, clip_id: string }) {
        const track = getTrackById(track_id)
        await track.deleteClip(clip_id)
        return Result.ok()
    }

    @tool({
        name: 'delete_device',
        description: 'delete device by index, start from 0',
        paramsSchema: {
            track_id: z.string(),
            index: z.number(),
        }
    })
    async deleteDeviceByIndex({ track_id, index }: { track_id: string, index: number }) {
        const track = getTrackById(track_id)
        await track.deleteDevice(index)
        return Result.ok()
    }

    @tool({
        name: 'create_audio_clip',
        description: `Create audio clip on track.
        Given an absolute path to a valid audio file in a supported format, 
        creates an audio clip that references the file at the specified position in the arrangement view.
        Prints an error if:
        - The track is not an audio track
        - The track is frozen
        - The track is being recorded into`,
        paramsSchema: {
            track_id: z.string(),
            file_path: z.string().describe('absolute path to audio file'),
            position: z.number().min(0).max(1576800).describe('position in beats'),
        }
    })
    async createAudioClip({ track_id, file_path, position }: { track_id: string, file_path: string, position: number }) {
        const track = getTrackById(track_id)
        await track.createAudioClip(file_path, position)
        return Result.ok()
    }
}

export default TrackTools