import { RawClip } from 'ableton-js/ns/clip.js'
import { GettableProperties as SongGettablePropsType } from 'ableton-js/ns/song.js'
import { RawTrack, SettableProperties as TrackSettablePropType } from 'ableton-js/ns/track.js'
import { Note } from 'ableton-js/util/note.js'
import { z } from 'zod'
import { createZodSchema } from '../utils/zod-type.js'

export const commomProp = {
    color: z.number().optional().describe(`The RGB value of the track's color in 
        the form 0x00RRGGBB or (2^16 * red) + (2^8 * green) + blue, where red, 
        green and blue are values from 0 (dark) to 255 (light). Example: Red is (2^16 * 255) = 16711680`),
    color_index: z.number().min(0).max(69)
        .describe('[int] the index of the color in the color palette.'),
    time: z.number().describe('[float] the time in beats of absolute clip time. such as 4 is 4 beats'),
}

export const NOTE = createZodSchema<Note>({
    pitch: z.number().min(0).max(127).describe('[int] the MIDI note number, 0...127, 60 is C3.'),
    time: z.number().describe('[float] the note start time in beats of absolute clip time.'),
    duration: z.number().describe('[float] the note length in beats.'),
    velocity: z.number().min(0).max(127)
        .describe('[float] the note velocity, 0 ... 127 (100 by default).'),
    muted: z.boolean().describe('[bool] true = the note is deactivated (false by default).')
})

export const RAW_CLIP = createZodSchema<RawClip>({
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

export const RAW_TRACK = createZodSchema<RawTrack>({
    id: z.string(),
    name: z.string(),
    color: z.number().describe(commomProp.color.description ?? ''),
    color_index: commomProp.color_index,
    is_foldable: z.boolean(),
    is_grouped: z.boolean(),
    mute: z.boolean(),
    solo: z.boolean(),
})

export const TrackSettableProp = createZodSchema<TrackSettablePropType>({
    arm: z.boolean().optional().describe('true = track is armed for recording. [not in return/master tracks]'),
    color: commomProp.color,
    // color_index: commomProp.color_index,
    current_input_routing: z.string().optional().describe('set the input routing ,such as "Resampling 3-MIDI 4 Audio"'),
    current_input_sub_routing: z.string().optional(),
    current_monitoring_state: z.number().optional(),
    current_output_routing: z.string().optional(),
    current_output_sub_routing: z.string().optional(),
    fired_slot_index: z.number().optional(),
    fold_state: z.number().optional().describe(`0 = tracks within the Group Track are visible, 
        1 = Group Track is folded and the tracks within the Group Track are hidden[only available if is_foldable = 1`),
    implicit_arm: z.boolean().optional(),
    input_routing_channel: z.number().optional(),
    is_showing_chains: z.number().optional(),
    mute: z.boolean().optional(),
    name: z.string().optional(),
    playing_slot_index: z.number().optional(),
    solo: z.boolean().optional().describe('solo = true = track is soloed. ')
})

export const ClipSettableProp = z.object({
    name: z.string().optional(),
    color: commomProp.color,
    // color_index: commomProp.color_index,
    end_marker: z.number().optional(),
    gain: z.number().optional(),
    is_playing: z.boolean().optional(),
    launch_mode: z.number().optional(),
    launch_quantization: z.number().optional(),
    loop_end: z.number().optional().describe('[float] For looped clips: loop end. For unlooped clips: clip end.'),
    loop_start: z.number().optional().describe(`[float] For looped clips: loop start.
        loop_start and loop_end are in absolute clip beat time if clip is MIDI or warped. 
        The 1.1.1 position has beat time 0. If the clip is unwarped audio, they are given in seconds, 
        0 is the time of the first sample in the audio material.`),
    looping: z.boolean().optional().describe('true = clip is looped. Unwarped audio cannot be looped.'),
    muted: z.boolean().optional(),
    pitch_coarse: z.number().optional().describe(`[int] Pitch shift in semitones ("Transpose"), -48 ... 48.
Available for audio clips only.`),
    pitch_fine: z.number().optional().describe(`[float] Extra pitch shift in cents ("Detune"), -50 ... 49.
Available for audio clips only.`),
    position: z.number().optional().describe(`[float] Get and set the clip's loop position. 
        The value will always equal loop_start, 
        however setting this property, unlike setting loop_start, preserves the loop length`),
    ram_mode: z.boolean().optional(),
    signature_denominator: z.number().optional(),
    signature_numerator: z.number().optional(),
    start_marker: z.number().optional().describe(`[float] The start marker of the clip in beats, 
        independent of the loop state. Cannot be set behind the end marker`),
    velocity_amount: z.number().optional(),
    warp_mode: z.number().optional().describe(`[int] The Warp Mode of the clip as an integer index. Available Warp Modes are:
        0 = Beats Mode
        1 = Tones Mode
        2 = Texture Mode
        3 = Re-Pitch Mode
        4 = Complex Mode
        5 = REX Mode
        6 = Complex Pro Mode
        Available for audio clips only.`),
    warping: z.boolean().optional().describe('Available for audio clips only.')
})

export const ZodQuantization = z.enum([
    'q_8_bars',
    'q_4_bars',
    'q_2_bars',
    'q_bar',
    'q_half',
    'q_half_triplet',
    'q_quarter',
    'q_quarter_triplet',
    'q_eight',
    'q_eight_triplet',
    'q_sixtenth',
    'q_sixtenth_triplet',
    'q_thirtytwoth',
    'q_no_q'
]).describe('Clip trigger quantization values')

export const ZodRecordingQuantization = z.enum([
    'rec_q_eight',
    'rec_q_eight_eight_triplet',
    'rec_q_eight_triplet',
    'rec_q_no_q',
    'rec_q_quarter',
    'rec_q_sixtenth',
    'rec_q_sixtenth_sixtenth_triplet',
    'rec_q_sixtenth_triplet',
    'rec_q_thirtysecond'
]).describe('MIDI recording quantization values')

export const SongSettableProp = z.object({
    appointed_device: z.string().optional(),
    arrangement_overdub: z.boolean().optional(),
    back_to_arranger: z.number().optional(),
    clip_trigger_quantization: ZodQuantization.optional(),
    count_in_duration: z.number().optional(),
    current_song_time: z.number().optional().describe('[float] the current song time in beats'),
    exclusive_arm: z.number().optional(),
    exclusive_solo: z.number().optional(),
    groove_amount: z.number().optional(),
    is_counting_in: z.boolean().optional(),
    is_playing: z.boolean().optional().describe('true = song is currently playing'),
    last_event_time: z.number().optional(),
    loop: z.boolean().optional().describe('true = arrangement loop is enabled'),
    loop_length: z.number().optional().describe('[float] length of the arrangement loop in beats'),
    loop_start: z.number().optional().describe('[float] start of the arrangement loop in beats'),
    master_track: z.number().optional(),
    metronome: z.number().optional(),
    midi_recording_quantization: ZodRecordingQuantization.optional(),
    nudge_down: z.boolean().optional(),
    nudge_up: z.boolean().optional(),
    overdub: z.boolean().optional(),
    punch_in: z.boolean().optional(),
    punch_out: z.boolean().optional(),
    re_enable_automation_enabled: z.number().optional(),
    record_mode: z.number().optional(),
    return_tracks: z.number().optional(),
    root_note: z.number().optional().describe('[int] the root note of the scale, 0..11, 0 = C, 1 = C#, etc.'),
    scale_name: z.number().optional().describe('[int] the index of the scale'),
    select_on_launch: z.number().optional(),
    session_automation_record: z.number().optional(),
    session_record: z.number().optional(),
    session_record_status: z.number().optional(),
    signature_denominator: z.number().optional().describe('[int] the denominator of the time signature'),
    signature_numerator: z.number().optional().describe('[int] the numerator of the time signature'),
    song_length: z.number().optional().describe('[float] the length of the song in beats'),
    swing_amount: z.number().optional(),
    tempo: z.number().optional().describe('[float] the tempo of the song in BPM'),
    tempo_follower_enabled: z.boolean().optional(),
    visible_tracks: z.number().optional()
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