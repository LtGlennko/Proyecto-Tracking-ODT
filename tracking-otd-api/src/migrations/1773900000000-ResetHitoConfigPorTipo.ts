import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetHitoConfigPorTipo1773900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Delete all per-vehicle-type configs
    await queryRunner.query(`DELETE FROM subetapa_tipo_vehiculo`);
    await queryRunner.query(`DELETE FROM hito_tipo_vehiculo`);

    // 2. Delete orphaned grupos paralelos (those with zero references)
    await queryRunner.query(`
      DELETE FROM grupo_paralelo
      WHERE id NOT IN (
        SELECT DISTINCT grupo_paralelo_id
        FROM hito_tipo_vehiculo
        WHERE grupo_paralelo_id IS NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot restore deleted configs — would need to re-run seed migration 1773600000000
    // This is intentionally left empty as the data is not recoverable
  }
}
