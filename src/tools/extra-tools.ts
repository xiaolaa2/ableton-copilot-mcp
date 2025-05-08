import { tool } from '../mcp/decorators/tool.js'
import { initAbletonJs, Result } from '../utils/common.js'

class ExtraTools {

    @tool({
        name: 'init_ableton_js',
        description: `Initialize ableton-js and copy its MIDI scripts to Ableton Live's MIDI Remote Scripts folder. 
            If ableton-js is already installed, it will update the content.`,
        skipAbletonCheck: true
    })
    async initAbletonJs() {
        initAbletonJs()
        return Result.ok()
    }
}

export default ExtraTools