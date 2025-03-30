import { RawClip } from 'ableton-js/ns/clip.js'
import { GettableProperties as SongGettablePropsType } from 'ableton-js/ns/song.js'
import { RawTrack } from 'ableton-js/ns/track.js'
import { Note } from 'ableton-js/util/note.js'
import { z } from 'zod'
import { createZodSchema } from '../utils/zod-type.js'

export const commomProp = {
    color: z.number().optional().describe(`The RGB value of the track's color in 
        the form 0x00rrggbb or (2^16 * red) + (2^8) * green + blue, where red, 
        green and blue are values from 0 (dark) to 255 (light) example: 8912743`),
    color_index: z.number().min(0).max(69)
        .describe('[int] the index of the color in the color palette.'),
    time: z.number().describe('[float] the time in beats of absolute clip time. such as 4 is 4 beats'),
}

export const NOTE: z.ZodType<Note> = z.object({
    pitch: z.number().min(0).max(127).describe('[int] the MIDI note number, 0...127, 60 is C3.'),
    time: z.number().describe('[float] the note start time in beats of absolute clip time.'),
    duration: z.number().describe('[float] the note length in beats.'),
    velocity: z.number().min(0).max(127)
        .describe('[float] the note velocity, 0 ... 127 (100 by default).'),
    muted: z.boolean().describe('[bool] true = the note is deactivated (false by default).')
})

export const RAW_CLIP: z.ZodType<RawClip> = z.object({
    id: z.string(),
    name: z.string(),
    color: z.number().describe(commomProp.color.description ?? ''),
    color_index: commomProp.color_index,
    is_audio_clip: z.boolean(),
    is_midi_clip: z.boolean(),
    start_time: z.number(),
    end_time: z.number(),
    muted: z.boolean(),
})

export const RAW_TRACK: z.ZodType<RawTrack> = z.object({
    id: z.string(),
    name: z.string(),
    color: z.number().describe(commomProp.color.description ?? ''),
    color_index: commomProp.color_index,
    is_foldable: z.boolean(),
    is_grouped: z.boolean(),
    mute: z.boolean(),
    solo: z.boolean(),
})

export const TrackSettableProp = z.object({
    arm: z.boolean().optional().describe('true = track is armed for recording. [not in return/master tracks]'),
    color: commomProp.color,
    color_index: commomProp.color_index,
    current_input_routing: z.string().optional(),
    current_input_sub_routing: z.string().optional(),
    current_monitoring_state: z.number().optional(),
    current_output_routing: z.string().optional(),
    current_output_sub_routing: z.string().optional(),
    fired_slot_index: z.number().optional(),
    fold_state: z.number().optional().describe(`0 = tracks within the Group Track are visible, 
        1 = Group Track is folded and the tracks within the Group Track are hidden[only available if is_foldable = 1`),
    implicit_arm: z.boolean().optional(),
    input_routing_channel: z.number().optional(),
    input_routing_type: z.number().optional(),
    input_routings: z.number().optional(),
    input_sub_routings: z.number().optional(),
    is_showing_chains: z.number().optional(),
    mute: z.boolean().optional(),
    name: z.string().optional(),
    output_routing_channel: z.number().optional(),
    output_routing_type: z.number().optional(),
    output_routings: z.number().optional(),
    output_sub_routings: z.number().optional(),
    playing_slot_index: z.number().optional(),
    solo: z.boolean().optional().describe('solo = true = track is soloed. ')
})

export const ClipSettableProp = z.object({
    name: z.string().optional(),
    color: commomProp.color,
    color_index: commomProp.color_index,
    end_marker: z.number().optional(),
    gain: z.number().optional(),
    is_playing: z.boolean().optional(),
    launch_mode: z.number().optional(),
    launch_quantization: z.number().optional(),
    loop_end: z.number().optional(),
    loop_start: z.number().optional(),
    looping: z.boolean().optional(),
    muted: z.boolean().optional(),
    pitch_coarse: z.number().optional(),
    pitch_fine: z.number().optional(),
    position: z.number().optional(),
    ram_mode: z.boolean().optional(),
    signature_denominator: z.number().optional(),
    signature_numerator: z.number().optional(),
    start_marker: z.number().optional(),
    velocity_amount: z.number().optional(),
    warp_mode: z.number().optional(),
    warping: z.boolean().optional()
})

export const SongGettableProps = createZodSchema<SongGettablePropsType>({
    root_note: z.number(),
    scale_name: z.number(),
    song_length: z.number(),
    tempo: z.number(),
})

export enum TrackType {
    return = 'return',
    audio = 'audio',
    midi = 'midi',
}

export const ZodTrackType = z.enum([
    TrackType.return,
    TrackType.audio,
    TrackType.midi,
]).describe('the type of track, "return", "audio", "midi"')