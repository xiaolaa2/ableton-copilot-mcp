import {
    Entity, PrimaryGeneratedColumn,
    Column, ManyToOne, JoinColumn
} from 'typeorm'
import { OperationHistory } from './OperationHistory.js'
import { Note } from 'ableton-js/util/note.js'

export enum SnapshotType {
    NOTE = 'NOTE',
}

export interface NoteSnapshotData {
    clip_id: string
    notes: Note[]
}

@Entity('snapshots')
export class Snapshot {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    history_id!: number

    @ManyToOne(() => OperationHistory)
    @JoinColumn({ name: 'history_id' })
    operationHistory?: OperationHistory

    @Column('text', { nullable: true })
    snapshot_data!: string | null

    @Column({ type: 'varchar', length: 20, enum: SnapshotType })
    snapshot_type!: SnapshotType

    @Column({ type: 'datetime', default: () => 'datetime(CURRENT_TIMESTAMP, \'localtime\')' })
    createdAt!: Date
}