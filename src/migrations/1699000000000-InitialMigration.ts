import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1699000000000 implements MigrationInterface {
    name = 'InitialMigration1699000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the migrations table to track executed migrations
        await queryRunner.query(`
            CREATE TABLE "migrations" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "timestamp" bigint NOT NULL,
                "name" varchar NOT NULL
            )
        `)

        // Create the operation_histories table
        await queryRunner.query(`
            CREATE TABLE "operation_histories" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "tool_name" varchar(100) NOT NULL,
                "input_params" text NULL,
                "execution_result" text NULL,
                "status" integer NOT NULL DEFAULT 0,
                "createdAt" datetime NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
            )
        `)

        // Create indexes for operation_histories table
        await queryRunner.query('CREATE INDEX "IDX_operation_histories_status" ON "operation_histories" ("status")')
        await queryRunner.query('CREATE INDEX "IDX_operation_histories_tool_name" ON "operation_histories" ("tool_name")')

        // Create the snapshots table
        await queryRunner.query(`
            CREATE TABLE "snapshots" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "history_id" integer NOT NULL,
                "snapshot_data" text NULL,
                "snapshot_type" varchar(20) NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
                CONSTRAINT "FK_snapshots_operation_histories" FOREIGN KEY ("history_id") REFERENCES "operation_histories" ("id") ON DELETE CASCADE
            )
        `)

        // Create index for snapshots table
        await queryRunner.query('CREATE INDEX "IDX_snapshots_history_id" ON "snapshots" ("history_id")')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query('DROP INDEX "IDX_operation_histories_status"')
        await queryRunner.query('DROP INDEX "IDX_operation_histories_tool_name"')
        await queryRunner.query('DROP INDEX "IDX_snapshots_history_id"')
        
        // Drop tables
        await queryRunner.query('DROP TABLE "snapshots"')
        await queryRunner.query('DROP TABLE "operation_histories"')
        await queryRunner.query('DROP TABLE "migrations"')
    }
} 