import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { commomProp, SongGettableProps, SongSettableProp, SongViewGettableProps, SongViewSettableProp, TrackType, ZodTrackType } from '../types/zod-types.js'
import { Track } from 'ableton-js/ns/track'
import { Result } from '../utils/common.js'
import { getSongProperties, getSongViewProps, modifySongProp, modifySongViewProp } from '../utils/obj-utils.js'
import { ableton } from '../ableton.js'
import { recordByTimeRange } from '../utils/record-utils.js'
import { logger } from '../main.js'

class SongTools {

    @tool({
        name: 'get_song_properties',
        description: 'get song properties. To get specific properties, set the corresponding property name to true in the properties parameter.',
        paramsSchema: SongGettableProps.shape
    })
    async getSongProperties(propertys: z.infer<typeof SongGettableProps>) {
        return await getSongProperties(ableton.song, propertys)
    }

    @tool({
        name: 'get_all_tracks',
        description: `List all tracks in the current song with their live IDs, names, and types (regular tracks and return
tracks). Use this to find a track_id when you only know the track name or position, or at the start of a session to build a
name-to-id map - track ids can change across session saves, so don't rely on a cached id from a previous session.
Returns each track's name individually rather than via get_song_properties({tracks: true}), which can be slower to fail
for a single track with an unusual name/state and take the whole list down with it.`,
        paramsSchema: {}
    })
    async getAllTracks() {
        const tracks = await ableton.song.get('tracks')
        const returnTracks = await ableton.song.get('return_tracks')

        const results: { index: number | string, id: string, name: string }[] = []

        await Promise.all(tracks.map(async (track, index) => {
            try {
                const name = await track.get('name')
                results[index] = { index, id: track.raw.id, name }
            } catch (error) {
                logger.warn(`Failed to get name for track ${track.raw.id}: ${error instanceof Error ? error.message : String(error)}`)
            }
        }))

        const returnResults = await Promise.all(returnTracks.map(async (track, index) => {
            try {
                const name = await track.get('name')
                return { index: `return_${index}`, id: track.raw.id, name }
            } catch (error) {
                logger.warn(`Failed to get name for return track ${track.raw.id}: ${error instanceof Error ? error.message : String(error)}`)
                return null
            }
        }))

        return [...results.filter(Boolean), ...returnResults.filter((r): r is NonNullable<typeof r> => r !== null)]
    }

    @tool({
        name: 'get_song_view_properties',
        description: 'get song view properties. To get specific properties, set the corresponding property name to true in the properties parameter.',
        paramsSchema: SongViewGettableProps.shape
    })
    async getSongViewProperties(propertys: z.infer<typeof SongViewGettableProps>) {
        return await getSongViewProps(ableton.song, propertys)
    }

    @tool({
        name: 'set_song_property',
        description: 'set song basic properties',
        paramsSchema: SongSettableProp.shape,
    })
    async setSongProperties(propertys: z.infer<typeof SongSettableProp>) {
        return await modifySongProp(ableton.song, propertys)
    }

    @tool({
        name: 'set_song_view_property',
        description: 'set song view properties',
        paramsSchema: SongViewSettableProp.shape,
    })
    async setSongViewProperties(propertys: z.infer<typeof SongViewSettableProp>) {
        return await modifySongViewProp(ableton.song, propertys)
    }

    @tool({
        name: 'create_track',
        description: 'create track and return raw track',
        paramsSchema: {
            type: ZodTrackType,
            index: z.number().optional().default(0).describe('[int] index of track default 0, range [0, track count]'),
        }
    })
    async createTrack({ type, index = 0 }: { type: TrackType, index?: number }) {
        let track: Track
        switch (type) {
            case TrackType.midi:
                track = await ableton.song.createMidiTrack(index)
                break
            case TrackType.audio:
                track = await ableton.song.createAudioTrack(index)
                break
            case TrackType.return:
                track = await ableton.song.createReturnTrack()
                break
        }
        return track.raw
    }

    @tool({
        name: 'delete_track',
        description: 'delete track by index',
        paramsSchema: {
            index: z.number().describe('[int] index of track'),
            type: ZodTrackType,
        }
    })
    async deleteTrack({ index, type }: { index: number, type: TrackType }) {

        switch (type) {
            case TrackType.midi:
            case TrackType.audio:
                await ableton.song.deleteTrack(index)
                break
            case TrackType.return:
                await ableton.song.deleteReturnTrack(index)
                break
            default:
                throw new Error('Invalid track type')
        }
        return Result.ok()
    }

    @tool({
        name: 'duplicate_track',
        description: 'duplicate midi or audio track by index',
        paramsSchema: {
            index: z.number().describe('[int] index of track'),
        }
    })
    async duplicateTrack({ index }: { index: number }) {
        await ableton.song.duplicateTrack(index)
        return Result.ok()
    }

    @tool({
        name: 'create_cue_point',
        description: `Create an arrangement locator (cue point) at the given time, optionally renamed. If the song is
currently playing, playback is paused first and resumed afterwards - jumping the playhead to set a cue while the transport
is running can drift the actual cue time away from what was requested.`,
        paramsSchema: {
            time: commomProp.time,
            name: z.string().optional().describe('name for the new cue point; leave unset to use the default Live-assigned name'),
        }
    })
    async createCuePoint({ time, name }: { time: number, name?: string }) {
        const wasPlaying = await ableton.song.get('is_playing')
        if (wasPlaying) {
            await ableton.song.set('is_playing', false)
        }

        const originalTime = await ableton.song.get('current_song_time')
        try {
            await ableton.song.set('current_song_time', time)
            await ableton.song.setOrDeleteCue()

            const cuePoints = await ableton.song.get('cue_points', false)
            const created = cuePoints.find(c => c.raw.time === time)
            if (!created) {
                throw new Error(`Failed to create cue point at time ${time} - it may already exist, or the transport moved before the cue could be set.`)
            }

            if (name) {
                await created.set('name', name)
            }

            return Result.data({ id: created.raw.id, name: name ?? created.raw.name, time })
        } finally {
            await ableton.song.set('current_song_time', originalTime)
            if (wasPlaying) {
                await ableton.song.set('is_playing', true)
            }
        }
    }

    @tool({
        name: 'delete_cue_point',
        description: `Delete an arrangement locator (cue point) by id. If the song is currently playing, playback is
paused first and resumed afterwards, for the same reason as create_cue_point.`,
        paramsSchema: {
            id: z.string().describe('cue point id, get from get_song_properties({cue_points: true}) or create_cue_point'),
        }
    })
    async deleteCuePoint({ id }: { id: string }) {
        const wasPlaying = await ableton.song.get('is_playing')
        if (wasPlaying) {
            await ableton.song.set('is_playing', false)
        }

        const originalTime = await ableton.song.get('current_song_time')
        try {
            const cuePoints = await ableton.song.get('cue_points', false)
            const target = cuePoints.find(c => c.raw.id === id)
            if (!target) {
                throw new Error(`Cue point ${id} not found`)
            }

            await ableton.song.set('current_song_time', target.raw.time)
            await ableton.song.setOrDeleteCue()

            return Result.ok()
        } finally {
            await ableton.song.set('current_song_time', originalTime)
            if (wasPlaying) {
                await ableton.song.set('is_playing', true)
            }
        }
    }

    @tool({
        name: 'record_by_time_range',
        description: `Opens Ableton's audio record button and starts playback from start_time to end_time. 
            Before recording, please:
            ENSURE: 
            1. Set the recording track to record mode
            2. Set the recording track's input routing to Resample or a specific audio track/input routing(get from get_track_available_input_routings tool)
            3. After recording, disable the track's record mode`,
        paramsSchema: {
            start_time: commomProp.time,
            end_time: z.number().describe('[int] end time of record'),
        }
    })
    async recordAudio({
        start_time, end_time
    }: {
        start_time: number,
        end_time: number,
    }) {
        return recordByTimeRange(ableton.song, start_time, end_time)
    }

}

export default SongTools