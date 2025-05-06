import { z } from 'zod'
import { tool } from '../mcp/decorators/tool.js'
import { Result } from '../utils/common.js'
import { getOperationHistoriesPage, getSnapShotByHistoryId, rollbackByHistoryId } from '../utils/snapshot-utils.js'

class HistoryTools {

    @tool({
        name: 'get_operation_histories',
        description: 'get mcp tools operation histories by page',
        paramsSchema: {
            page: z.number(),
            page_size: z.number(),
        }
    })
    async getOperationHistories({ page, page_size }: { page: number, page_size: number }) {
        return getOperationHistoriesPage(page, page_size)
    }

    @tool({
        name: 'get_snapshot_by_history_id',
        description: 'get snapshot by history id',
        paramsSchema: {
            history_id: z.number().describe('The id of the operation history. Must be a value greater than 0.'),
        }
    })
    async getSnapshotById({ history_id }: { history_id: number }) {
        return getSnapShotByHistoryId(history_id)
    }

    @tool({
        name: 'rollback_by_history_id',
        description: `rollback to the state before the operation corresponding to the history_id was executed, 
        currently supports Note operations`,
        paramsSchema: {
            history_id: z.number().describe('The id of the operation history.'),
        }
    })
    async rollbackByHistoryId({ history_id }: { history_id: number }) {
        await rollbackByHistoryId(history_id)
        return Result.ok()
    }
}

export default HistoryTools