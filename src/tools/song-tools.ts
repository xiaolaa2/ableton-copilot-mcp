import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { commomProp, SongGettableProps, SongSettableProp, SongViewGettableProps, SongViewSettableProp, TrackType, ZodTrackType } from '../types/zod-types.js'
import { Track } from 'ableton-js/ns/track.js'
import { Result } from '../utils/common.js'
import { getSongProperties, getSongViewProps, modifySongProp, modifySongViewProp } from '../utils/obj-utils.js'
import { ableton } from '../ableton.js'
import { recordByTimeRange } from '../utils/record-utils.js'

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

    // @tool({
    //     name: 'move_track',
    //     description: 'move track by index',
    //     paramsSchema: {
    //         track_id: z.string(),
    //         to_index: z.number().describe('[int] index of track'),
    //     }
    // })
    // async moveTrack(track_id: string, to_index: number) {

    //     return Result.ok()
    // }
}

export default SongTools