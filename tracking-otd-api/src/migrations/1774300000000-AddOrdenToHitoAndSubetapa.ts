import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdenToHitoAndSubetapa1774300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add orden column to hito table
    await queryRunner.query(`ALTER TABLE hito ADD COLUMN IF NOT EXISTS orden integer NOT NULL DEFAULT 0`);
    // Set initial orden based on current id order
    await queryRunner.query(`
      UPDATE hito SET orden = sub.rn FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM hito
      ) sub WHERE hito.id = sub.id
    `);

    // Add orden column to subetapa table
    await queryRunner.query(`ALTER TABLE subetapa ADD COLUMN IF NOT EXISTS orden integer NOT NULL DEFAULT 0`);
    // Set initial orden based on current id order within each hito
    await queryRunner.query(`
      UPDATE subetapa SET orden = sub.rn FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY hito_id ORDER BY id) AS rn FROM subetapa
      ) sub WHERE subetapa.id = sub.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE subetapa DROP COLUMN IF EXISTS orden`);
    await queryRunner.query(`ALTER TABLE hito DROP COLUMN IF EXISTS orden`);
  }
}
