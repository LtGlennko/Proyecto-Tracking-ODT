import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Move all hitos into a single grupo_paralelo (id=1) by default.
 * Remove grupo 2 since it's no longer needed as a default.
 */
export class AllHitosToSingleGroup1773800000000 implements MigrationInterface {
    name = 'AllHitosToSingleGroup1773800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Move all hito configs to grupo 1
        await queryRunner.query(`
            UPDATE "hito_tipo_vehiculo"
            SET "grupo_paralelo_id" = 1
            WHERE "grupo_paralelo_id" IS NULL OR "grupo_paralelo_id" != 1
        `);

        // Delete grupo 2 (no longer referenced)
        await queryRunner.query(`
            DELETE FROM "grupo_paralelo" WHERE "id" > 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-create grupo 2 and reassign PDI/Crédito/Facturación/Pago
        await queryRunner.query(`
            INSERT INTO "grupo_paralelo" ("id", "nombre", "descripcion")
            VALUES (2, 'Paralelo Financiero-Operativo', 'Bloque paralelo: PDI, Crédito, Facturación, Pago')
            ON CONFLICT ("id") DO NOTHING
        `);
        await queryRunner.query(`
            UPDATE "hito_tipo_vehiculo"
            SET "grupo_paralelo_id" = 2
            WHERE "hito_id" IN (3, 4, 5, 6)
        `);
    }
}
