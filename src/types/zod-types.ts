import { RawClip } from 'ableton-js/ns/clip.js'
import { GettableProperties as SongGettablePropsType, SettableProperties as SongSettablePropsType } from 'ableton-js/ns/song.js'
import { GettableProperties as SongViewGettablePropsType, SettableProperties as SongViewSettablePropType } from 'ableton-js/ns/song-view.js'
import { RawTrack, SettableProperties as TrackSettablePropType, GettableProperties as TrackGettablePropType } from 'ableton-js/ns/track.js'
import { GettableProperties as DeviceGettablePropertiesType } from 'ableton-js/ns/device.js'
import { GettableProperties as DeviceParameterGettablePropertiesType } from 'ableton-js/ns/device-parameter.js'
import { GettableProperties as MixerDeviceGettablePropType } from 'ableton-js/ns/mixer-device.js'
import { GettableProperties as ClipGettablePropType } from 'ableton-js/ns/clip.js'
import { GettableProperties as SceneGettablePropType } from 'ableton-js/ns/scene.js'
import { GettableProperties as ClipSlotGettablePropType } from 'ableton-js/ns/clip-slot.js'
import { Note } from 'ableton-js/util/note.js'
import { z } from 'zod'
import { createZodSchema } from '../utils/common.js'

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

const MixerDeviceSettableProp = createZodSchema<Omit<MixerDeviceGettablePropType, 'crossfade_assign'>>({
    volume: z.number().min(0).max(1).optional().describe(`[float] the volume of the device, 
        linear range 0.0 to 1.0. 0.0 is approx -69 dB (mute), 1.0 is +6 dB.`),
    panning: z.number().min(-1).max(1).optional().describe('[float] the pan of the device, -1... 1'),
    track_activator: z.number().optional().describe('[int] track activation state, 0 = track disabled, 1 = track enabled'),
    left_split_stereo: z.number().min(0).max(1).optional()
        .describe('[float] the stereo split of the device, -1... 1. Only works when panning_mode is "Split Stereo"'),
    right_split_stereo: z.number().min(0).max(1).optional()
        .describe('[float] the stereo split of the device, -1... 1. Only works when panning_mode is "Split Stereo"'),
    panning_mode: z.number().optional().describe(`[int] Access to the 
        Track mixer's pan mode: 0 = Stereo, 1 = Split Stereo..`),
})

export const MixerDeviceGettableProp = MixerDeviceSettableProp

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
    solo: z.boolean().optional().describe('solo = true = track is soloed. '),
}).extend({
    mixer_device: MixerDeviceSettableProp.optional(),
})

export const TrackGettableProps = createZodSchema<TrackGettablePropType>({
    arm: z.boolean().optional(),
    arrangement_clips: z.boolean().optional(),
    available_input_routing_channels: z.boolean().optional(),
    available_input_routing_types: z.boolean().optional(),
    available_output_routing_channels: z.boolean().optional(),
    available_output_routing_types: z.boolean().optional(),
    can_be_armed: z.boolean().optional(),
    can_be_frozen: z.boolean().optional(),
    can_show_chains: z.boolean().optional(),
    canonical_parent: z.boolean().optional(),
    color: z.boolean().optional(),
    current_input_routing: z.boolean().optional(),
    current_input_sub_routing: z.boolean().optional(),
    current_monitoring_state: z.boolean().optional(),
    current_output_routing: z.boolean().optional(),
    current_output_sub_routing: z.boolean().optional(),
    devices: z.boolean().optional(),
    fired_slot_index: z.boolean().optional(),
    fold_state: z.boolean().optional(),
    has_audio_input: z.boolean().optional(),
    has_audio_output: z.boolean().optional(),
    has_midi_input: z.boolean().optional(),
    has_midi_output: z.boolean().optional(),
    implicit_arm: z.boolean().optional(),
    input_meter_left: z.boolean().optional(),
    input_meter_level: z.boolean().optional(),
    input_meter_right: z.boolean().optional(),
    is_foldable: z.boolean().optional(),
    is_frozen: z.boolean().optional(),
    is_grouped: z.boolean().optional(),
    is_part_of_selection: z.boolean().optional(),
    is_showing_chains: z.boolean().optional(),
    is_visible: z.boolean().optional(),
    mixer_device: z.boolean().optional(),
    mute: z.boolean().optional(),
    muted_via_solo: z.boolean().optional(),
    name: z.boolean().optional(),
    output_meter_left: z.boolean().optional(),
    output_meter_level: z.boolean().optional(),
    output_meter_right: z.boolean().optional(),
    playing_slot_index: z.boolean().optional(),
    solo: z.boolean().optional()
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

export const ClipGettableProp = createZodSchema<ClipGettablePropType>({
    available_warp_modes: z.boolean().optional(),
    color: z.boolean().optional(),
    color_index: z.boolean().optional(),
    end_marker: z.boolean().optional(),
    end_time: z.boolean().optional(),
    file_path: z.boolean().optional(),
    gain: z.boolean().optional(),
    gain_display_string: z.boolean().optional(),
    has_envelopes: z.boolean().optional(),
    is_arrangement_clip: z.boolean().optional(),
    is_audio_clip: z.boolean().optional(),
    is_midi_clip: z.boolean().optional(),
    is_overdubbing: z.boolean().optional(),
    is_playing: z.boolean().optional(),
    is_recording: z.boolean().optional(),
    is_triggered: z.boolean().optional(),
    launch_mode: z.boolean().optional(),
    launch_quantization: z.boolean().optional(),
    length: z.boolean().optional(),
    loop_end: z.boolean().optional(),
    loop_start: z.boolean().optional(),
    looping: z.boolean().optional(),
    muted: z.boolean().optional(),
    name: z.boolean().optional(),
    pitch_coarse: z.boolean().optional(),
    pitch_fine: z.boolean().optional(),
    playing_position: z.boolean().optional(),
    position: z.boolean().optional(),
    ram_mode: z.boolean().optional(),
    sample_length: z.boolean().optional(),
    selected_notes: z.boolean().optional(),
    signature_denominator: z.boolean().optional(),
    signature_numerator: z.boolean().optional(),
    start_marker: z.boolean().optional(),
    start_time: z.boolean().optional(),
    velocity_amount: z.boolean().optional(),
    warp_mode: z.boolean().optional(),
    warp_markers: z.boolean().optional(),
    warping: z.boolean().optional(),
    will_record_on_start: z.boolean().optional()
}).extend({
    notes: z.boolean().optional(),
    selected_notes: z.boolean().optional(),
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

export const SongSettableProp = createZodSchema<SongSettablePropsType>({
    clip_trigger_quantization: ZodQuantization.optional().describe('[enum] The quantization value for clip triggering'),
    count_in_duration: z.number().optional().describe('[float] The duration of count-in in beats'),
    current_song_time: z.number().optional().describe('[float] the current song time in beats'),
    exclusive_arm: z.number().optional().describe('[int] The exclusive arm state'),
    exclusive_solo: z.number().optional().describe('[int] The exclusive solo state'),
    groove_amount: z.number().optional().describe('[float] The amount of groove applied'),
    is_counting_in: z.boolean().optional().describe('[boolean] true = count-in is active'),
    is_playing: z.boolean().optional().describe('true = song is currently playing'),
    loop: z.boolean().optional().describe('true = arrangement loop is enabled'),
    loop_length: z.number().optional().describe('[float] length of the arrangement loop in beats'),
    loop_start: z.number().optional().describe('[float] start of the arrangement loop in beats'),
    midi_recording_quantization: ZodRecordingQuantization.optional()
        .describe('[enum] The quantization value for MIDI recording'),
    re_enable_automation_enabled: z.number().optional().describe('[int] The state of re-enable automation feature'),
    record_mode: z.number().optional().describe('[int] 1 = the Arrangement Record button is on.'),
    song_length: z.number().optional().describe('[float] the length of the song in beats'),
    swing_amount: z.number().optional().describe('[float] The amount of swing applied'),
    tempo: z.number().optional().describe('[float] the tempo of the song in BPM'),
})

export const SongGettableProps = createZodSchema<SongGettablePropsType>({
    appointed_device: z.boolean().optional(),
    arrangement_overdub: z.boolean().optional(),
    back_to_arranger: z.boolean().optional(),
    can_capture_midi: z.boolean().optional(),
    can_jump_to_next_cue: z.boolean().optional(),
    can_jump_to_prev_cue: z.boolean().optional(),
    can_redo: z.boolean().optional(),
    can_undo: z.boolean().optional(),
    clip_trigger_quantization: z.boolean().optional(),
    count_in_duration: z.boolean().optional(),
    cue_points: z.boolean().optional(),
    current_song_time: z.boolean().optional(),
    exclusive_arm: z.boolean().optional(),
    exclusive_solo: z.boolean().optional(),
    groove_amount: z.boolean().optional(),
    is_counting_in: z.boolean().optional(),
    is_playing: z.boolean().optional(),
    last_event_time: z.boolean().optional(),
    loop: z.boolean().optional(),
    loop_length: z.boolean().optional(),
    loop_start: z.boolean().optional(),
    master_track: z.boolean().optional(),
    metronome: z.boolean().optional(),
    midi_recording_quantization: z.boolean().optional(),
    nudge_down: z.boolean().optional(),
    nudge_up: z.boolean().optional(),
    overdub: z.boolean().optional(),
    punch_in: z.boolean().optional(),
    punch_out: z.boolean().optional(),
    re_enable_automation_enabled: z.boolean().optional(),
    record_mode: z.boolean().optional(),
    return_tracks: z.boolean().optional(),
    root_note: z.boolean().optional(),
    scale_name: z.boolean().optional(),
    scenes: z.boolean().optional(),
    select_on_launch: z.boolean().optional(),
    session_automation_record: z.boolean().optional(),
    session_record: z.boolean().optional(),
    session_record_status: z.boolean().optional(),
    signature_denominator: z.boolean().optional(),
    signature_numerator: z.boolean().optional(),
    song_length: z.boolean().optional(),
    swing_amount: z.boolean().optional(),
    tempo: z.boolean().optional(),
    tempo_follower_enabled: z.boolean().optional(),
    tracks: z.boolean().optional(),
    visible_tracks: z.boolean().optional(),
}).extend({
    name: z.boolean().optional(),
})

export const SongViewGettableProps = createZodSchema<SongViewGettablePropsType>({
    detail_clip: z.boolean().optional().describe('[RawClip] details of currently selected clip'),
    draw_mode: z.boolean().optional().describe('[boolean] whether in draw mode'),
    follow_song: z.boolean().optional().describe('[boolean] whether following playback position'),
    highlighted_clip_slot: z.boolean().optional().describe('[RawClipSlot] currently highlighted clip slot'),
    selected_chain: z.boolean().optional().describe('[any] currently selected device chain'),
    selected_parameter: z.boolean().optional().describe('[RawDeviceParameter] currently selected device parameter'),
    selected_scene: z.boolean().optional().describe('[RawScene] currently selected scene'),
    selected_track: z.boolean().optional().describe('[RawTrack] currently selected track')
})

export const SongViewSettableProp = createZodSchema<SongViewSettablePropType>({
    detail_clip: z.string().optional().describe('[string] clip id to select'),
    draw_mode: z.boolean().optional().describe('[boolean] whether in draw mode'),
    follow_song: z.boolean().optional().describe('[boolean] whether following playback position'),
    highlighted_clip_slot: z.number().optional().describe('[RawClipSlot] currently highlighted clip slot'),
    selected_scene: z.string().optional().describe('[string] scene id to select'),
    selected_track: z.string().optional().describe('[string] track id to select'),
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

export const DeviceGettableProperties = createZodSchema<DeviceGettablePropertiesType>({
    type: z.boolean(),
    name: z.boolean(),
    class_name: z.boolean(),
    is_active: z.boolean(),
    class_display_name: z.boolean(),
    can_have_chains: z.boolean(),
    can_have_drum_pads: z.boolean(),
    parameters: z.boolean(),
})

export const DeviceParameterGettableProperties = createZodSchema<DeviceParameterGettablePropertiesType>({
    automation_state: z.boolean().optional().describe('[int] The automation state of the parameter'),
    default_value: z.boolean().optional().describe('[string] The default value of the parameter'),
    is_enabled: z.boolean().optional().describe('[boolean] Whether the parameter is enabled'),
    is_quantized: z.boolean().optional().describe('[boolean] Whether the parameter is quantized'),
    max: z.boolean().optional().describe('[float] The maximum value of the parameter'),
    min: z.boolean().optional().describe('[float] The minimum value of the parameter'),
    name: z.boolean().optional().describe('[string] The name of the parameter'),
    original_name: z.boolean().optional().describe('[string] The original name of the parameter'),
    state: z.boolean().optional().describe('[int] The state of the parameter'),
    value: z.boolean().optional().describe('[float] The current value of the parameter'),
    value_items: z.boolean().optional().describe('[string[]] The list of possible values for the parameter'),
})

export const SceneGettableProperties = createZodSchema<SceneGettablePropType>({
    name: z.boolean(),
    tempo: z.boolean(),
    clip_slots: z.boolean(),
    color: z.boolean(),
    color_index: z.boolean(),
    is_empty: z.boolean(),
    is_triggered: z.boolean(),
})

export const ClipSlotGettableProperties = createZodSchema<ClipSlotGettablePropType>({
    clip: z.boolean().optional(),
    color: z.boolean().optional(),
    color_index: z.boolean().optional(),
    controls_other_clips: z.boolean().optional(),
    has_clip: z.boolean().optional(),
    has_stop_button: z.boolean().optional(),
    is_group_slot: z.boolean().optional(),
    is_playing: z.boolean().optional(),
    is_recording: z.boolean().optional(),
    is_triggered: z.boolean().optional(),
    playing_status: z.boolean().optional(),
    will_record_on_start: z.boolean().optional()
})