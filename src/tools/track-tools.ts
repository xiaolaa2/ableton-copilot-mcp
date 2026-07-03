import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { commomProp, TrackGettableProps, TrackSettableProp } from '../types/zod-types.js'
import { batchModifyTrackProp, getTrackProps } from '../utils/obj-utils.js'
import { Result } from '../utils/common.js'
import { getTrackById, getClipById } from '../utils/obj-utils.js'
import { getDeviceParamterProps, modifyDeviceParameterVal } from '../utils/obj-utils.js'
import { ErrorTypes } from '../mcp/error-handler.js'
import { ableton } from '../ableton.js'
import { getNotes } from '../utils/clip-utils.js'

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
        name: 'get_track_overview',
        description: `One-call summary of what's actually on one or more tracks: name, type (midi/audio), mute/solo,
loaded device names, and every arrangement clip's id/name/start_time/end_time/length/note_count - sorted by start time.
Omit track_ids for every track in the song. Use this first when picking up a session, instead of chaining
get_all_tracks + get_track_properties + get_clip_notes just to see what's already built.`,
        paramsSchema: {
            track_ids: z.array(z.string()).optional().describe('omit for every track in the song'),
        }
    })
    async getTrackOverview({ track_ids }: { track_ids?: string[] }) {
        let ids = track_ids
        if (!ids) {
            const tracks = await ableton.song.get('tracks')
            ids = tracks.map(t => t.raw.id)
        }

        return Promise.all(ids.map(async (track_id) => {
            try {
                const track = getTrackById(track_id)
                const props = await getTrackProps(track, {
                    name: true,
                    has_midi_input: true,
                    has_audio_input: true,
                    mute: true,
                    solo: true,
                    devices: true,
                    arrangement_clips: true,
                } as any)

                const devices = (props.devices ?? []) as { name: string }[]
                const clips = (props.arrangement_clips ?? []) as { id: string, name: string, start_time: number, end_time: number }[]

                const clipsWithNoteCount = await Promise.all(clips.map(async (clip) => {
                    let note_count = 0
                    try {
                        const clipObj = getClipById(clip.id)
                        const notes = await getNotes(clipObj, 0, 128, 0, 99999999999999)
                        note_count = notes.length
                    } catch {
                        // audio clips and clips that fail to read notes just report 0
                    }
                    return {
                        id: clip.id,
                        name: clip.name,
                        start_time: clip.start_time,
                        end_time: clip.end_time,
                        length: clip.end_time - clip.start_time,
                        note_count,
                    }
                }))
                clipsWithNoteCount.sort((a, b) => a.start_time - b.start_time)

                return {
                    track_id,
                    name: props.name,
                    type: props.has_midi_input ? 'midi' : (props.has_audio_input ? 'audio' : 'other'),
                    mute: props.mute,
                    solo: props.solo,
                    devices: devices.map(d => d.name),
                    arrangement_clips: clipsWithNoteCount,
                }
            } catch (error) {
                return { track_id, error: error instanceof Error ? error.message : String(error) }
            }
        }))
    }

    @tool({
        name: 'create_clips_batch',
        description: `Batch version of create_midi_clip - creates multiple empty MIDI clips across one or more tracks
in one call. Each entry is isolated - one failure doesn't fail the rest of the batch.`,
        paramsSchema: {
            clips: z.array(z.object({
                track_id: z.string(),
                length: z.number().describe('Length is given in beats and must be a greater value than 0.0.'),
                time: commomProp.time,
            }))
        }
    })
    async createClipsBatch({ clips }: { clips: { track_id: string, length: number, time: number }[] }) {
        const results = await Promise.all(clips.map(async ({ track_id, length, time }) => {
            try {
                const track = getTrackById(track_id)
                const clipSlots = await track.get('clip_slots')
                const lastClipSlot = clipSlots.at(-1)
                if (!lastClipSlot) {
                    throw new Error('No clip slot available')
                }

                const hasExistingClip = await lastClipSlot.get('has_clip')
                if (hasExistingClip) {
                    await lastClipSlot.deleteClip()
                }

                await lastClipSlot.createClip(length)
                const newlyCreatedClip = await lastClipSlot.get('clip')
                if (!newlyCreatedClip) {
                    throw new Error('Failed to create MIDI clip')
                }

                const clip = await track.duplicateClipToArrangement(newlyCreatedClip, time)
                return { track_id, status: 'ok' as const, clip: clip.raw }
            } catch (error) {
                return { track_id, status: 'error' as const, error: error instanceof Error ? error.message : String(error) }
            }
        }))
        return Result.data(results)
    }

    @tool({
        name: 'get_track_sends',
        description: `Get a track's send levels to each return track. Returns one entry per return track (index 0 =
Return A, 1 = Return B, ...), with the send's device parameter properties (including 'value', the raw 0-1 float - see
set_track_send's description for how that maps to dB).`,
        paramsSchema: {
            track_id: z.string(),
        }
    })
    async getTrackSends({ track_id }: { track_id: string }) {
        const track = getTrackById(track_id)
        const mixerDevice = await track.get('mixer_device')
        const sends = await mixerDevice.get('sends')
        return Promise.all(sends.map((send, index) => getDeviceParamterProps(send).then(props => ({ index, ...props }))))
    }

    @tool({
        name: 'set_track_send',
        description: `Set a track's send level to a return track. 'value' is the raw 0-1 float the underlying device
parameter uses, not a dB value directly - the mapping is non-linear and much steeper than it looks (roughly
dB ~= 52.93 * log10(value) - 3.39), so e.g. 0.2 is already down around -40dB, not a gentle touch of send. Get
send_index and the parameter's min/max from get_track_sends first.`,
        paramsSchema: {
            track_id: z.string(),
            send_index: z.number().describe('[int] index into the sends array from get_track_sends, e.g. 0 = Return A'),
            value: z.number(),
        }
    })
    async setTrackSend({ track_id, send_index, value }: { track_id: string, send_index: number, value: number }) {
        const track = getTrackById(track_id)
        const mixerDevice = await track.get('mixer_device')
        const sends = await mixerDevice.get('sends')
        const send = sends[send_index]
        if (!send) {
            throw ErrorTypes.INVALID_ARGUMENT(`send_index ${send_index} is out of range (track has ${sends.length} send(s))`)
        }
        await modifyDeviceParameterVal(send, value)
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