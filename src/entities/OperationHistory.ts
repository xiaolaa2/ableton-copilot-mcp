import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export enum OperationStatus {
    PENDING = 0,
    SUCCESS = 1,
    FAILED = 2,
}

@Entity('operation_histories')
export class OperationHistory {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ length: 100 })
    tool_name!: string

    @Column('text', { nullable: true })
    input_params!: string | null

    @Column('text', { nullable: true })
    execution_result!: string | null

    @Column({ type: 'integer', enum: OperationStatus, default: OperationStatus.PENDING })
    status!: OperationStatus

    @Column({ type: 'datetime', default: () => 'datetime(CURRENT_TIMESTAMP, \'localtime\')' })
    createdAt!: Date
}