import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { Result } from '../utils/common.js'
import { getDeviceById, getDeviceParameterById } from '../utils/obj-utils.js'
import { getDeviceProps, modifyDeviceParameterVal } from '../utils/obj-utils.js'
import { getChainById, getChainProps, modifyChainProp, getDrumPadById, getDrumPadProps, modifyDrumPadProp } from '../utils/obj-utils.js'
import { DeviceGettableProperties, ChainGettableProperties, ChainSettableProp, DrumPadGettableProperties, DrumPadSettableProp } from '../types/zod-types.js'

class DeviceTools {

    @tool({
        name: 'get_device_properties',
        description: 'get device properties. To get specific properties, set the corresponding property name to true in the properties parameter',
        paramsSchema: {
            device_id: z.string(),
            properties: DeviceGettableProperties,
        }
    })
    async getDeviceProperties({ device_id, properties }: { device_id: string, properties: z.infer<typeof DeviceGettableProperties> }) {
        const device = getDeviceById(device_id)
        return getDeviceProps(device, properties)
    }

    @tool({
        name: 'modify_device_parameter_value',
        description: 'set device parameter value, only support built-in Live devices',
        paramsSchema: {
            parameter_id: z.string().describe('parameter id, get from get_device_properties'),
            value: z.number(),
        }
    })
    async setDeviceParameter({ parameter_id, value }: { parameter_id: string, value: any }) {
        const parameter = getDeviceParameterById(parameter_id)
        modifyDeviceParameterVal(parameter, value)
        return Result.ok()
    }

    @tool({
        name: 'get_chain_properties',
        description: `Get properties of a chain inside a rack device (Instrument/Audio Effect/MIDI Effect Rack). Get a
chain_id from get_device_properties({device_id, properties: {chains: true}}) on a rack device (or {return_chain: true} for
an effect rack's return chain, or {drum_pads: true} on a Drum Rack device then {chains: true} on a get_drum_pad_properties
call). To get specific properties, set the corresponding property name to true in the properties parameter.`,
        paramsSchema: {
            chain_id: z.string(),
            properties: ChainGettableProperties,
        }
    })
    async getChainProperties({ chain_id, properties }: { chain_id: string, properties: z.infer<typeof ChainGettableProperties> }) {
        const chain = getChainById(chain_id)
        return getChainProps(chain, properties)
    }

    @tool({
        name: 'set_chain_property',
        description: 'Set mute/solo on a chain inside a rack device. Get chain_id from get_chain_properties/get_device_properties.',
        paramsSchema: {
            chain_id: z.string(),
            property: ChainSettableProp,
        }
    })
    async setChainProperty({ chain_id, property }: { chain_id: string, property: z.infer<typeof ChainSettableProp> }) {
        const chain = getChainById(chain_id)
        await modifyChainProp(chain, property)
        return Result.ok()
    }

    @tool({
        name: 'get_drum_pad_properties',
        description: `Get properties of a drum pad inside a Drum Rack device (per-voice note/mute/solo, and its chain(s) for
reaching the pad's own device chain, e.g. its Simpler). Get a drum_pad_id from
get_device_properties({device_id, properties: {drum_pads: true}}) on a Drum Rack device. To get specific properties, set the
corresponding property name to true in the properties parameter.`,
        paramsSchema: {
            drum_pad_id: z.string(),
            properties: DrumPadGettableProperties,
        }
    })
    async getDrumPadProperties({ drum_pad_id, properties }: { drum_pad_id: string, properties: z.infer<typeof DrumPadGettableProperties> }) {
        const drumPad = getDrumPadById(drum_pad_id)
        return getDrumPadProps(drumPad, properties)
    }

    @tool({
        name: 'set_drum_pad_property',
        description: 'Set mute/solo on a drum pad inside a Drum Rack device. Get drum_pad_id from get_drum_pad_properties/get_device_properties.',
        paramsSchema: {
            drum_pad_id: z.string(),
            property: DrumPadSettableProp,
        }
    })
    async setDrumPadProperty({ drum_pad_id, property }: { drum_pad_id: string, property: z.infer<typeof DrumPadSettableProp> }) {
        const drumPad = getDrumPadById(drum_pad_id)
        await modifyDrumPadProp(drumPad, property)
        return Result.ok()
    }

}

export default DeviceTools