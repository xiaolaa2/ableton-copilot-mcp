import { Track } from 'ableton-js/ns/track.js'
import { ClipSettableProp, SongGettableProps, TrackSettableProp } from '../types/types.js'
import { z } from 'zod'
import { getObjProps, modifyObjProps } from './common.js'
import { Clip } from 'ableton-js/ns/clip.js'
import { Song } from 'ableton-js/ns/song.js'

/**
 * modify track property
 */
export function modifyTrackProp(track: Track, property: z.infer<typeof TrackSettableProp>) {
    return modifyObjProps(track, property, TrackSettableProp)
}

/**
 * modify clip property
 */
export function modifyClipProp(clip: Clip, property: z.infer<typeof ClipSettableProp>) {
    return modifyObjProps(clip, property, ClipSettableProp)
}

/**
 * get song property
 */
export async function getSongInfo(song: Song) {
    const props = await getObjProps(song, SongGettableProps)
    return props
}