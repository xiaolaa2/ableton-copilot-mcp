import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { getDeviceById, getDeviceParameterById, Result } from '../utils/common.js'
import { getDeviceProps, modifyDeviceParameterVal } from '../utils/obj-utils.js'
import { DeviceGettableProperties } from '../types/zod-types.js'

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

}

export default DeviceTools