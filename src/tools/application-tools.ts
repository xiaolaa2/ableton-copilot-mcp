import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { Result } from '../utils/common.js'
import { ableton } from '../ableton.js'
import { getAppProperties } from '../utils/obj-utils.js'
import { ApplicationGettableProps } from '../types/zod-types.js'

class ApplicationTools {

    @tool({
        name: 'get_application_info',
        description: 'Get Ableton Live application information. To get specific properties, set the corresponding property name to true in the properties parameter. If no properties are specified, returns all available information.',
        paramsSchema: ApplicationGettableProps.shape
    })
    async getApplicationInfo(properties: z.infer<typeof ApplicationGettableProps>) {
        const result = await getAppProperties(ableton.application, properties)
        return Result.data(result)
    }
}

export default ApplicationTools