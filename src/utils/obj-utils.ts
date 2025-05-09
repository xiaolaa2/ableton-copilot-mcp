import { RawTrack, Track } from 'ableton-js/ns/track.js'
import {
    ClipGettableProp,
    ClipSettableProp, ClipSlotGettableProperties, DeviceGettableProperties, DeviceParameterGettableProperties, MixerDeviceGettableProp, SceneGettableProperties,
    SongSettableProp, SongViewGettableProps, SongViewSettableProp, TrackGettableProps, TrackSettableProp
} from '../types/zod-types.js'
import { z } from 'zod'
import { Clip, RawClip } from 'ableton-js/ns/clip.js'
import { Song } from 'ableton-js/ns/song.js'
import { ableton } from '../ableton.js'
import { Namespace } from 'ableton-js/ns/index.js'
import { DeviceParameter, RawDeviceParameter } from 'ableton-js/ns/device-parameter.js'
import { Device, DeviceType, RawDevice } from 'ableton-js/ns/device.js'
import { MixerDevice } from 'ableton-js/ns/mixer-device.js'
import { logger } from '../main.js'
import { CuePoint } from 'ableton-js/ns/cue-point.js'
import { Scene } from 'ableton-js/ns/scene.js'
import { ClipSlot } from 'ableton-js/ns/clip-slot.js'
import { RawBrowserItem, BrowserItem } from 'ableton-js/ns/browser-item.js'
import { ErrorTypes } from '../mcp/error-handler.js'

export function modifyObjProps<T extends Namespace<any, any, SP, any>, SP>(
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

export async function getObjProps<
    T extends Namespace<any, any, any, any>,
    S extends z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny, any, any>
>(
    obj: T,
    scheme: S | Record<string, boolean>
): Promise<z.infer<S>> {
    const result: Record<string, any> = {}
    const errors: Record<string, string> = {}
    const promiseResults: Promise<void>[] = []

    // Get all property names to fetch
    const propertyKeys = scheme instanceof z.ZodObject
        ? Object.keys(scheme.shape)
        : Object.keys(scheme).filter(key => scheme[key] === true)

    // Create a promise for each property
    for (const key of propertyKeys) {
        const promise = obj.get(key)
            .then((value) => {
                result[key] = value
            })
            .catch((err) => {
                const errorMessage = err instanceof Error ? err.message : String(err)
                logger.warn(`Failed to get property "${key}": ${errorMessage}`)
                errors[key] = errorMessage
            })

        promiseResults.push(promise)
    }

    // Wait for all promises to complete
    await Promise.all(promiseResults)

    // Log summary if there were errors
    const errorCount = Object.keys(errors).length
    if (errorCount > 0) {
        logger.warn(`Failed to get ${errorCount} properties: ${Object.keys(errors).join(', ')}`)
    }

    return result as z.infer<S>
}

/**
 * modify track property
 */
export function modifyTrackProp(track: Track, property: z.infer<typeof TrackSettableProp>) {
    return modifyObjProps(track, property, TrackSettableProp)
}

export async function batchModifyTrackProp(tracks: { track_id: string, property: z.infer<typeof TrackSettableProp> }[]) {
    const promises = tracks.map(async ({ track_id, property }) => {
        const raw_track = getRawTrackById(track_id)
        const track = new Track(ableton, raw_track)
        const { mixer_device, ...restProperty } = property
        await modifyTrackProp(track, restProperty)
        if (mixer_device) {
            for (const key of Object.keys(mixer_device)) {
                const typedKey = key as keyof typeof mixer_device
                const value = mixer_device[typedKey]
                if (value === undefined || value === null) {
                    continue
                }
                const mixerDevice = await track.get('mixer_device')
                const parameter = await mixerDevice.get(typedKey) as DeviceParameter | null
                if (parameter !== undefined && parameter !== null) {
                    if (parameter instanceof DeviceParameter) {
                        await modifyDeviceParameterVal(parameter, value)
                    } else {
                        mixerDevice.set(typedKey, value)
                    }
                }
            }
        }
    })
    await Promise.all(promises)
}

export async function getTrackProps(
    track: Track,
    scheme: z.infer<typeof TrackGettableProps>
) {
    const props = await getObjProps(track, scheme)
    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (Array.isArray(value) && value.length > 0) {
            if (value[0] instanceof Device) {
                props[typedKey] = (value as Device[]).map(device => device.raw)
            } else if (value[0] instanceof Clip) {
                props[typedKey] = value.map(clip => clip.raw)
            }
        } else if (value instanceof MixerDevice) {
            props[typedKey] = await getMixerDeviceProps(value)
        }
    }
    return props
}

/**
 * modify clip property
 */
export function modifyClipProp(clip: Clip, property: z.infer<typeof ClipSettableProp>) {
    return modifyObjProps(clip, property, ClipSettableProp)
}

export async function batchModifyClipProp(clips: { clip_id: string, property: z.infer<typeof ClipSettableProp> }[]) {
    const promises = clips.map(async ({ clip_id, property }) => {
        const clip = await getClipById(clip_id)
        await modifyClipProp(clip, property)
    })
    await Promise.all(promises)
}

export async function getClipProps(
    clip: Clip,
    scheme: Record<string, boolean> | z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny, any, any>
) {
    return await getObjProps(clip, scheme)
}

/**
 * get song property
 */
export async function getSongProperties(
    song: Song,
    scheme: Record<string, boolean> | z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny, any, any>
) {
    const props = await getObjProps(song, scheme)
    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (Array.isArray(value) && value.length > 0) {
            const firstValue = value[0]
            if (firstValue instanceof Track) {
                props[typedKey] = (value as Track[]).map(track => track.raw)
            } else if (firstValue instanceof CuePoint) {
                props[typedKey] = (value as CuePoint[]).map(cuePoint => cuePoint.raw)
            } else if (firstValue instanceof Scene) {
                props[typedKey] = await Promise.all((value as Scene[]).map(scene => getSceneProps(scene)))
            }
        } else if (value instanceof Track) {
            props[typedKey] = value.raw
        }
    }
    return props
}

export async function getSongViewProps(
    song: Song,
    scheme: z.infer<typeof SongViewGettableProps>
) {
    const props = await getObjProps(song.view, scheme)

    if (scheme.detail_clip && (props.detail_clip === null || props.detail_clip === undefined)) {
        throw new Error('please open piano roll')
    }

    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (value instanceof Track) {
            props[typedKey] = value.raw
        } else if (value instanceof Scene) {
            props[typedKey] = value.raw
        } else if (value instanceof ClipSlot) {
            props[typedKey] = value.raw
        } else if (value instanceof Clip) {
            props[typedKey] = value.raw
        } else if (value instanceof DeviceParameter) {
            props[typedKey] = await getDeviceParamterProps(value)
        }
    }
    return props
}

export async function getDeviceParamterProps(parameter: DeviceParameter) {
    const props = await getObjProps(parameter, DeviceParameterGettableProperties)
    return {
        ...props,
        id: parameter.raw.id
    }
}

/**
 * get device propertys
 */
export async function getDeviceProps(
    device: Device,
    schema: z.infer<typeof DeviceGettableProperties>
) {
    const props = await getObjProps(device, schema)
    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (Array.isArray(value) && value.length > 0) {
            const firstValue = value[0]
            if (firstValue instanceof DeviceParameter) {
                props[typedKey] = await Promise.all((value as DeviceParameter[]).map(parameter => {
                    return getDeviceParamterProps(parameter)
                }))
            }
        }
    }
    return props
}

/**
 * modify song propertys
 */
export function modifySongProp(song: Song, property: z.infer<typeof SongSettableProp>) {
    return modifyObjProps(song, property, SongSettableProp)
}

/**
 * modify song view propertys
 */
export function modifySongViewProp(song: Song, property: z.infer<typeof SongViewSettableProp>) {
    return modifyObjProps(song.view, property, SongViewSettableProp)
}

export async function modifyDeviceParameterVal(parameter: DeviceParameter, value: any) {
    const isEnabled = await parameter.get('is_enabled')
    const name = await parameter.get('name')
    if (!isEnabled) {
        throw new Error(`parameter ${name} is disabled`)
    }
    const max = await parameter.get('max')
    const min = await parameter.get('min')
    if (value > max || value < min) {
        throw new Error(`parameter ${name} value ${value} is out of range (min: ${min}, max: ${max})`)
    }
    await parameter.set('value', value)
}

export async function getMixerDeviceProps(device: MixerDevice) {
    const props = await getObjProps(device, MixerDeviceGettableProp)
    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (value instanceof DeviceParameter) {
            props[typedKey] = value.raw
        }
    }
    return props
}

export async function getSceneProps(scene: Scene) {
    const props = await getObjProps(scene, SceneGettableProperties)
    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (Array.isArray(value) && value.length > 0) {
            const firstValue = value[0]
            if (firstValue instanceof ClipSlot) {
                props[typedKey] = value.map((clipSlot) => (clipSlot as ClipSlot).raw)
            } else {
                props[typedKey] = value
            }
        } else {
            props[typedKey] = value
        }
    }
    return props
}

export async function getClipSlotProps(clipSlot: ClipSlot) {
    const props = await getObjProps(clipSlot, ClipSlotGettableProperties)
    for (const key of Object.keys(props)) {
        const typedKey = key as keyof typeof props
        const value = props[typedKey]
        if (value instanceof Clip) {
            props[typedKey] = getClipProps(value, ClipGettableProp)
        } else {
            props[typedKey] = value
        }
    }
    return props
}
/**
 * 获取原始Track对象
 * @param trackId 轨道ID
 * @returns 原始Track对象
 */

export function getRawTrackById(trackId: string): RawTrack {
    if (!trackId) {
        throw ErrorTypes.INVALID_ARGUMENT('Track ID is required')
    }

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
/**
 * 获取Track对象
 * @param trackId 轨道ID
 * @returns Track对象
 */

export function getTrackById(trackId: string): Track {
    const rawTrack = getRawTrackById(trackId)
    return new Track(ableton, rawTrack)
}
/**
 * 获取原始Clip对象
 * @param clipId 片段ID
 * @returns 原始Clip对象
 */

export function getRawClipById(clipId: string): RawClip {
    if (!clipId) {
        throw ErrorTypes.INVALID_ARGUMENT('Clip ID is required')
    }

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
/**
 * 获取Clip对象
 * @param clipId 片段ID
 * @returns Clip对象
 */

export function getClipById(clipId: string): Clip {
    const rawClip = getRawClipById(clipId)
    return new Clip(ableton, rawClip)
}
/**
 * 获取原始浏览器项目对象
 * @param id 项目ID
 * @returns 原始浏览器项目对象
 */

export function getRawBrowserItemById(id: string): RawBrowserItem {
    if (!id) {
        throw ErrorTypes.INVALID_ARGUMENT('Browser item ID is required')
    }

    return {
        id: id,
        children: [],
        name: '',
        is_loadable: false,
        is_selected: false,
        is_device: false,
        is_folder: false,
        source: '',
        uri: '',
    }
}
/**
 * 获取浏览器项目对象
 * @param id 项目ID
 * @returns 浏览器项目对象
 */

export function getBrowserItemById(id: string) {
    const rawBrowserItem = getRawBrowserItemById(id)
    return new BrowserItem(ableton, rawBrowserItem)
}
/**
 * 获取原始设备对象
 * @param id 设备ID
 * @returns 原始设备对象
 */

export function getRawDeviceById(id: string): RawDevice {
    if (!id) {
        throw ErrorTypes.INVALID_ARGUMENT('Device ID is required')
    }

    return {
        id: id,
        name: '',
        type: DeviceType.Undefined,
        class_name: '',
    }
}
/**
 * 获取原始设备参数对象
 * @param id 参数ID
 * @returns 原始设备参数对象
 */

export function getRawDeviceParameterById(id: string): RawDeviceParameter {
    if (!id) {
        throw ErrorTypes.INVALID_ARGUMENT('Device parameter ID is required')
    }

    return {
        id: id,
        name: '',
        value: 0,
        is_quantized: false,
    }
}
/**
 * 获取设备参数对象
 * @param id 参数ID
 * @returns 设备参数对象
 */

export function getDeviceParameterById(id: string) {
    const rawDeviceParameter = getRawDeviceParameterById(id)
    return new DeviceParameter(ableton, rawDeviceParameter)
}
/**
 * 获取设备对象
 * @param id 设备ID
 * @returns 设备对象
 */

export function getDeviceById(id: string) {
    const rawDevice = getRawDeviceById(id)
    return new Device(ableton, rawDevice)
}
