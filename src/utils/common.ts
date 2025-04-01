import { Namespace } from 'ableton-js/ns/index.js'
import { RawTrack, Track } from 'ableton-js/ns/track.js'
import { z } from 'zod'
import { Clip, RawClip } from 'ableton-js/ns/clip.js'
import { ableton } from '../ableton.js'

export function modifyObjProps<T extends Namespace<any, any, SP, any>, SP>
    (
        obj: T,
        property: Partial<SP>,
        zodSchema: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny, any, any>
    ) {
    const promiseArray: Promise<any>[] = []

    const schema = zodSchema.shape

    for (const key of Object.keys(property)) {
        const typedKey = key as keyof typeof property
        if (!Object.keys(schema).includes(typedKey as string)) {
            continue
        }
        const value = property[typedKey]

        if (value !== undefined) {
            promiseArray.push(obj.set(typedKey, value))
        }
    }
    return Promise.allSettled(promiseArray)
}

export function getObjProps<
    T extends Namespace<any, any, any, any>,
    S extends z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny, any, any>
>
    (
        obj: T,
        zodSchema: S
    ): Promise<z.infer<S>> {
    const promiseArray: Promise<any>[] = []
    const result: any = {}

    for (const key of Object.keys(zodSchema.shape)) {
        promiseArray.push(obj.get(key).then((value) => {
            result[key] = value
        }))
    }

    return Promise.allSettled(promiseArray).then(() => {
        return result
    })
}

export function getRawTrackById(trackId: string): RawTrack {
    return {
        id: trackId,
        name: '',
        color: 0,
        color_index: 0,
        is_foldable: false,
        is_grouped: false,
        mute: false,
        solo: false,
    }
}

export function getTrackById(trackId: string): Track {
    const rawTrack = getRawTrackById(trackId)
    return new Track(ableton, rawTrack)
}

export function getRawClipById(clipId: string): RawClip {
    return {
        id: clipId,
        name: '',
        color: 0,
        color_index: 0,
        is_audio_clip: false,
        is_midi_clip: false,
        start_time: 0,
        end_time: 0,
        muted: false,
    }
}

export function getClipById(clipId: string): Clip {
    const rawClip = getRawClipById(clipId)
    return new Clip(ableton, rawClip)
}

export class Result {

    static ok(): string {
        return 'ok'
    }
}