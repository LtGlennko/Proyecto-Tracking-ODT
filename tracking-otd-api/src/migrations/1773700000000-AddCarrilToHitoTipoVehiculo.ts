import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Add carril column to hito_tipo_vehiculo so each vehicle type
 * can have its own carril assignment (overrides hito.carril).
 * Seed existing rows with the master hito.carril value.
 */
export class AddCarrilToHitoTipoVehiculo1773700000000 implements MigrationInterface {
    name = 'AddCarrilToHitoTipoVehiculo1773700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "hito_tipo_vehiculo"
            ADD COLUMN "carril" character varying
        `);

        // Seed: copy carril from master hito into each config row
        await queryRunner.query(`
            UPDATE "hito_tipo_vehiculo" htv
            SET "carril" = h."carril"
            FROM "hito" h
            WHERE htv."hito_id" = h."id"
              AND h."carril" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "hito_tipo_vehiculo"
            DROP COLUMN "carril"
        `);
    }
}
