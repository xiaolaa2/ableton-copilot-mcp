import { tool } from '../mcp/decorators/tool.js'
import { z } from 'zod'
import { Result } from '../utils/common.js'
import { listResources, loadDevice, ResourceType } from '../utils/browser-utils.js'

class BrowserTools {

    @tool({
        name: 'list_resources',
        description: 'List Ableton live Browser resources of specified type',
        paramsSchema: {
            type: z.enum([
                ResourceType.AUDIO_EFFECTS,
                ResourceType.INSTRUMENTS,
                ResourceType.PLUGINS,
                ResourceType.SAMPLES,
                ResourceType.DRUMS,
                ResourceType.MIDI_EFFECTS,
                ResourceType.SOUNDS
            ]).describe('[string] resources type')
        }
    })
    async listResources({ type }: { type: ResourceType }) {
        return await listResources(type)
    }

    @tool({
        name: 'load_device',
        description: `Load a resource which is loadable (audio effect/instrument/plugin/drums/midi effect/sounds) into a track.
        If track_id is not provided, will load to currently selected track.
        If no track is selected, instruments will be loaded to the last MIDI track, 
        and audio effects will be loaded to the last MIDI or audio track.`,
        paramsSchema: {
            device_id: z.string().describe('[string] id of device to load'),
            track_id: z.string().optional().describe('[string] track id to load item to'),
        }
    })
    async loadItem({ device_id, track_id }: { device_id: string, track_id?: string }) {
        await loadDevice(device_id, track_id)
        return Result.ok()
    }
}

export default BrowserTools