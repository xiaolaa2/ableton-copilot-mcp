import { logger } from '../main.js'
import { getOperationHistoryRepository, getSnapshotRepository } from '../db.js'
import { OperationHistory } from '../entities/OperationHistory.js'
import { NoteSnapshotData, Snapshot, SnapshotType } from '../entities/Snapshot.js'
import { getClipById } from './common.js'
import { FindOneOptions } from 'typeorm'
import { removeAllNotes } from './clip-utils.js'

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
    const snapshot = await getSnapShotByHistoryId(historyId)
    if (!snapshot) {
        logger.warn(`Snapshot not found for historyId: ${historyId}`)
        return
    }
    if (!snapshot.snapshot_data) {
        logger.warn(`Snapshot data is empty for historyId: ${historyId}`)
        return
    }

    switch (snapshot.snapshot_type) {
        case SnapshotType.NOTE:
            {
                const noteData = JSON.parse(snapshot.snapshot_data) as NoteSnapshotData
                await rollbackNoteSnapshot(noteData)
                break
            }
        default:
            throw new Error('Unsupported snapshot type')
    }
}

async function rollbackNoteSnapshot(snapshot_data: NoteSnapshotData): Promise<void> {
    if (!snapshot_data) {
        logger.warn('Rollback attempted with empty NoteSnapshotData')
        return
    }
    const { clip_id, notes } = snapshot_data
    const clip = getClipById(clip_id)
    if (!clip) {
        throw new Error(`Clip with id ${clip_id} not found during rollback.`)
    }
    await removeAllNotes(clip)
    await clip.setNotes(notes)
}