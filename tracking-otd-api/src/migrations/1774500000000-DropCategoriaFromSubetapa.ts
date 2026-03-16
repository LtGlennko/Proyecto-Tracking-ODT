import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCategoriaFromSubetapa1774500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subetapa" DROP COLUMN IF EXISTS "categoria"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subetapa" ADD COLUMN "categoria" character varying(100)`);
  }
}
