import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsuarioEmpresaAndSeed1773400000000 implements MigrationInterface {
  name = 'UsuarioEmpresaAndSeed1773400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create join table usuario_empresa
    await queryRunner.query(`
      CREATE TABLE "usuario_empresa" (
        "usuario_id" integer NOT NULL,
        "empresa_id" integer NOT NULL,
        CONSTRAINT "PK_usuario_empresa" PRIMARY KEY ("usuario_id", "empresa_id"),
        CONSTRAINT "FK_usuario_empresa_usuario" FOREIGN KEY ("usuario_id")
          REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_usuario_empresa_empresa" FOREIGN KEY ("empresa_id")
          REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_usuario_empresa_usuario" ON "usuario_empresa" ("usuario_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_usuario_empresa_empresa" ON "usuario_empresa" ("empresa_id")
    `);

    // 2. Seed the 3 empresas (if they don't exist yet)
    await queryRunner.query(`
      INSERT INTO "empresa" ("nombre", "codigo")
      VALUES
        ('Divemotor', 'DIVEMOTOR'),
        ('Andes Motor', 'ANDES_MOTOR'),
        ('Andes Maq', 'ANDES_MAQ')
      ON CONFLICT ("codigo") DO NOTHING
    `);

    // 3. Seed the superadmin bypass user
    await queryRunner.query(`
      INSERT INTO "usuario" ("azure_ad_oid", "nombre", "email", "perfil", "activo")
      VALUES (
        '00000000-0000-4000-8000-000000000001',
        'Developer Kaufmann',
        'dev@kaufmann.cl',
        'superadministrador',
        true
      )
      ON CONFLICT ("azure_ad_oid") DO UPDATE SET "perfil" = 'superadministrador'
    `);

    // 4. Assign all empresas to the superadmin
    await queryRunner.query(`
      INSERT INTO "usuario_empresa" ("usuario_id", "empresa_id")
      SELECT u.id, e.id
      FROM "usuario" u, "empresa" e
      WHERE u.azure_ad_oid = '00000000-0000-4000-8000-000000000001'
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_usuario_empresa_empresa"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_usuario_empresa_usuario"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuario_empresa"`);
    // Don't delete seed data in down — it's harmless to keep
  }
}
