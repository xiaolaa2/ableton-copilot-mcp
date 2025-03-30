import { z } from 'zod'
import { ableton } from '../main.js'
import { tool } from '../mcp/decorators/decorator.js'
import { TrackType, ZodTrackType } from '../types/types.js'
import { Track } from 'ableton-js/ns/track.js'
import { Result } from '../utils/common.js'
import { getSongInfo } from '../utils/obj-utils.js'

class SongTools {

    @tool({
        name: 'get_song_info',
        description: `get song basic info, include tempo, 
        time signature, root_note(begin from 0, C..B), scale name, song length`,
    })
    async getSongInfo() {
        const song = await ableton.song
        return await getSongInfo(song)
    }

    @tool({
        name: 'get_all_tracks',
        description: 'get all tracks',
    })
    async getAllTracks() {
        const tracks = await ableton.song.get('tracks')
        return tracks.map((track) => track.raw)
    }

    @tool({
        name: 'get_tracks_count',
        description: 'get midi + audio tracks count',
    })
    async getTracksTotalCount() {
        const tracks = await ableton.song.get('tracks')
        return tracks.length
    }

    @tool({
        name: 'create_track',
        description: 'create track and return raw track',
        paramsSchema: {
            type: ZodTrackType,
            index: z.number().optional().default(0).describe('[int] index of track default 0, range [0, track count]'),
        }
    })
    async createTrack(type: TrackType, index: number) {
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
    async deleteTrack(index: number, type: TrackType) {
        switch (type) {
            case TrackType.midi || TrackType.audio:
                await ableton.song.deleteTrack(index)
                break
            case TrackType.return:
                await ableton.song.deleteReturnTrack(index)
                break
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
    async duplicateTrack(index: number) {
        await ableton.song.duplicateTrack(index)
        return Result.ok()
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