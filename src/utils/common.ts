import { RawTrack, Track } from 'ableton-js/ns/track.js'
import { z } from 'zod'
import { Clip, RawClip } from 'ableton-js/ns/clip.js'
import { ableton } from '../ableton.js'
import { BrowserItem, RawBrowserItem } from 'ableton-js/ns/browser-item.js'
import { Device, DeviceType, RawDevice } from 'ableton-js/ns/device.js'
import { DeviceParameter, RawDeviceParameter } from 'ableton-js/ns/device-parameter.js'
import { ErrorTypes } from '../mcp/error-handler.js'

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

/**
 * 操作结果类
 */
export class Result {
    static ok(): string {
        return 'ok'
    }
    
    static error(message: string): { error: string } {
        return { error: message }
    }
    
    static data<T>(data: T): { data: T } {
        return { data }
    }
}

/**
 * 创建Zod模式
 * @param props 属性对象
 * @returns Zod模式
 */
export function createZodSchema<T>(props: {
    [K in keyof T]?: z.ZodTypeAny
}) {
    return z
        .object(props as z.ZodRawShape)
        .partial()
}
