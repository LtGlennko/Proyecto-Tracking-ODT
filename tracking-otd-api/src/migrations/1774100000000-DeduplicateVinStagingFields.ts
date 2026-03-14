import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes duplicated informational fields from `vin` table.
 * Source of truth for these fields is now `staging_vin`.
 *
 * Fields moved:
 *   vin.modelo        → staging_vin.modelo_comercial
 *   vin.linea_negocio → staging_vin.linea_negocio
 *   vin.lote          → staging_vin.lote_asignado
 *   vin.ejecutivo_sap → staging_vin.nombre_vendedor
 *   vin.orden_compra  → staging_vin.pedido_interno
 *   vin.segmento      → staging_vin.clase
 *
 * The tracking service now reads these via LEFT JOIN staging_vin with COALESCE.
 */
export class DeduplicateVinStagingFields1774100000000 implements MigrationInterface {
  name = 'DeduplicateVinStagingFields1774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. For VINs without a staging_vin record, create one with the informational fields
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno", "clase")
      SELECT v."id", v."modelo", v."linea_negocio", v."lote", v."ejecutivo_sap", v."orden_compra", v."segmento"
      FROM "vin" v
      WHERE NOT EXISTS (SELECT 1 FROM "staging_vin" sv WHERE sv."vin" = v."id")
    `);

    // 2. For VINs that already have staging_vin records, fill NULLs from vin
    await queryRunner.query(`
      UPDATE "staging_vin" sv
      SET
        "modelo_comercial" = COALESCE(sv."modelo_comercial", v."modelo"),
        "linea_negocio"    = COALESCE(sv."linea_negocio",    v."linea_negocio"),
        "lote_asignado"    = COALESCE(sv."lote_asignado",    v."lote"),
        "nombre_vendedor"  = COALESCE(sv."nombre_vendedor",  v."ejecutivo_sap"),
        "pedido_interno"   = COALESCE(sv."pedido_interno",   v."orden_compra"),
        "clase"            = COALESCE(sv."clase",            v."segmento")
      FROM "vin" v
      WHERE sv."vin" = v."id"
    `);

    // 3. Drop duplicated columns from vin
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "modelo"`);
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "linea_negocio"`);
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "lote"`);
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "ejecutivo_sap"`);
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "orden_compra"`);
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "segmento"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Re-add columns
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN "modelo" character varying`);
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN "linea_negocio" character varying`);
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN "lote" character varying`);
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN "ejecutivo_sap" character varying`);
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN "orden_compra" character varying`);
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN "segmento" character varying`);

    // 2. Repopulate from staging_vin
    await queryRunner.query(`
      UPDATE "vin" v
      SET
        "modelo"        = sv."modelo_comercial",
        "linea_negocio" = sv."linea_negocio",
        "lote"          = sv."lote_asignado",
        "ejecutivo_sap" = sv."nombre_vendedor",
        "orden_compra"  = sv."pedido_interno",
        "segmento"      = sv."clase"
      FROM "staging_vin" sv
      WHERE sv."vin" = v."id"
    `);
  }
}
