import { logger } from '../main.js'
import { getOperationHistoryRepository, getSnapshotRepository } from '../db.js'
import { OperationHistory, OperationStatus } from '../entities/OperationHistory.js'
import { NoteSnapshotData, Snapshot, SnapshotType } from '../entities/Snapshot.js'
import { getClipById } from './obj-utils.js'
import { FindOneOptions } from 'typeorm'
import { removeAllNotes } from './clip-utils.js'
import { ErrorTypes } from '../mcp/error-handler.js'

export async function createOperationHistory(
    operation: Omit<OperationHistory, 'id' | 'createdAt'>
): Promise<number> {
    const repo = getOperationHistoryRepository()
    try {
        const newHistory = repo.create(operation)
        const savedHistory = await repo.save(newHistory)
        return savedHistory.id
    } catch (err) {
        logger.error('Failed to create operation history', err)
        throw err
    }
}

export async function updateOperationHistoryById(
    id: number,
    operation: Partial<Omit<OperationHistory, 'id' | 'createdAt'>>
): Promise<void> {
    const repo = getOperationHistoryRepository()
    try {
        const result = await repo.update(id, operation)
        if (result.affected === 0) {
            logger.warn(`Operation history with id ${id} not found for update.`)
        }
    } catch (err) {
        logger.error('Failed to update operation history', err)
        throw err
    }
}

export async function getOperationHistoriesPage(page: number, pageSize: number): Promise<OperationHistory[]> {
    const repo = getOperationHistoryRepository()
    try {
        return await repo.find({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })
    } catch (err) {
        logger.error('Failed to get operation histories', err)
        throw err
    }
}

export async function getOperationHistoryById(id: number): Promise<OperationHistory | null> {
    const repo = getOperationHistoryRepository()
    try {
        return await repo.findOneBy({ id })
    } catch (err) {
        logger.error('Failed to get operation history by id', err)
        throw err
    }
}

export async function createSnapshot(
    snapshotData: Omit<Snapshot, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
    const repo = getSnapshotRepository()
    try {
        const newSnapshot = repo.create(snapshotData)
        const savedSnapshot = await repo.save(newSnapshot)
        return savedSnapshot.id
    } catch (err) {
        logger.error('Failed to create snapshot', err)
        throw err
    }
}

export async function getSnapShotByHistoryId(historyId: number): Promise<Snapshot | null> {
    const repo = getSnapshotRepository()
    try {
        const options: FindOneOptions<Snapshot> = {
            where: { history_id: historyId },
        }
        return await repo.findOne(options)
    } catch (err) {
        logger.error('Failed to get snapshot by history_id', err)
        throw err
    }
}

export async function rollbackByHistoryId(historyId: number): Promise<void> {
    const history = await getOperationHistoryById(historyId)
    if (!history) {
        throw ErrorTypes.NOT_FOUND(`Operation history not found for historyId: ${historyId}`)
    }
    if (history.status !== OperationStatus.SUCCESS) {
        throw ErrorTypes.INTERNAL_ERROR(`Operation history with id ${historyId} is not successful, cannot be rolled back.`)
    }

    const snapshot = await getSnapShotByHistoryId(historyId)
    if (!snapshot) {
        throw ErrorTypes.NOT_FOUND(`Snapshot not found for historyId: ${historyId}`)
    }
    if (!snapshot.snapshot_data) {
        throw ErrorTypes.INTERNAL_ERROR(`Snapshot data is empty for historyId: ${historyId}`)
    }

    switch (snapshot.snapshot_type) {
        case SnapshotType.NOTE:
            {
                const noteData = JSON.parse(snapshot.snapshot_data) as NoteSnapshotData
                await rollbackNoteSnapshot(noteData)
                break
            }
        default:
            throw ErrorTypes.INTERNAL_ERROR('Unsupported snapshot type')
    }
}

async function rollbackNoteSnapshot(snapshot_data: NoteSnapshotData): Promise<void> {
    const { clip_id, notes } = snapshot_data
    const clip = getClipById(clip_id)
    if (!clip) {
        throw ErrorTypes.NOT_FOUND(`Clip with id ${clip_id} not found during rollback.`)
    }
    await removeAllNotes(clip)
    await clip.setNotes(notes)
}