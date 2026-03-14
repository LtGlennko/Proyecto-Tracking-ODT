import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyTipoVehiculoEntity1774200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla maestra tipo_vehiculo
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tipo_vehiculo (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(50) NOT NULL UNIQUE,
        color VARCHAR(20),
        activo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 2. Seed 4 tipos de vehículo
    await queryRunner.query(`
      INSERT INTO tipo_vehiculo (nombre, slug, color) VALUES
        ('Camión', 'camion', '#2E75B6'),
        ('Bus', 'bus', '#7C3AED'),
        ('Maquinaria', 'maquinaria', '#EA580C'),
        ('Vehículo Ligero', 'vehiculo_ligero', '#0EA5E9')
      ON CONFLICT (slug) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        color = EXCLUDED.color;
    `);

    // 3. Agregar columna tipo_vehiculo_id a vin
    await queryRunner.query(`ALTER TABLE vin ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INTEGER;`);
    // Migrar datos existentes (mapear string → ID)
    await queryRunner.query(`
      UPDATE vin SET tipo_vehiculo_id = tv.id
      FROM tipo_vehiculo tv
      WHERE (
        (vin.tipo_vehiculo = 'Camión' AND tv.slug = 'camion') OR
        (vin.tipo_vehiculo = 'Bus' AND tv.slug = 'bus') OR
        (vin.tipo_vehiculo = 'Maquinaria' AND tv.slug = 'maquinaria') OR
        (vin.tipo_vehiculo = 'Vehículo Ligero' AND tv.slug = 'vehiculo_ligero')
      );
    `);
    await queryRunner.query(`ALTER TABLE vin ADD CONSTRAINT fk_vin_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo(id);`);
    // Drop old column and index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vin_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE vin DROP COLUMN IF EXISTS tipo_vehiculo;`);
    await queryRunner.query(`CREATE INDEX idx_vin_tipo_vehiculo_id ON vin(tipo_vehiculo_id);`);

    // 4. hito_tipo_vehiculo: add tipo_vehiculo_id, migrate, drop old column
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INTEGER;`);
    await queryRunner.query(`
      UPDATE hito_tipo_vehiculo SET tipo_vehiculo_id = tv.id
      FROM tipo_vehiculo tv
      WHERE hito_tipo_vehiculo.tipo_vehiculo = tv.slug;
    `);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo ADD CONSTRAINT fk_htv_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo(id);`);
    // Drop old unique constraint, column, add new unique
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo DROP CONSTRAINT IF EXISTS uq_hito_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo DROP COLUMN IF EXISTS tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo ALTER COLUMN tipo_vehiculo_id SET NOT NULL;`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo ADD CONSTRAINT uq_hito_tipo_vehiculo UNIQUE (hito_id, tipo_vehiculo_id);`);

    // 5. subetapa_tipo_vehiculo: add tipo_vehiculo_id, migrate, drop old column
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INTEGER;`);
    await queryRunner.query(`
      UPDATE subetapa_tipo_vehiculo SET tipo_vehiculo_id = tv.id
      FROM tipo_vehiculo tv
      WHERE subetapa_tipo_vehiculo.tipo_vehiculo = tv.slug;
    `);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo ADD CONSTRAINT fk_stv_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo(id);`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo DROP CONSTRAINT IF EXISTS uq_subetapa_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo DROP COLUMN IF EXISTS tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo ALTER COLUMN tipo_vehiculo_id SET NOT NULL;`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo ADD CONSTRAINT uq_subetapa_tipo_vehiculo UNIQUE (subetapa_id, tipo_vehiculo_id);`);

    // 6. subetapa_config: add tipo_vehiculo_id, migrate, drop old column
    await queryRunner.query(`ALTER TABLE subetapa_config ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INTEGER;`);
    await queryRunner.query(`
      UPDATE subetapa_config SET tipo_vehiculo_id = tv.id
      FROM tipo_vehiculo tv
      WHERE (
        (subetapa_config.tipo_vehiculo = tv.slug) OR
        (subetapa_config.tipo_vehiculo = 'Camión' AND tv.slug = 'camion') OR
        (subetapa_config.tipo_vehiculo = 'Bus' AND tv.slug = 'bus') OR
        (subetapa_config.tipo_vehiculo = 'Maquinaria' AND tv.slug = 'maquinaria') OR
        (subetapa_config.tipo_vehiculo = 'Vehículo Ligero' AND tv.slug = 'vehiculo_ligero')
      );
    `);
    await queryRunner.query(`ALTER TABLE subetapa_config ADD CONSTRAINT fk_sc_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo(id);`);
    await queryRunner.query(`ALTER TABLE subetapa_config DROP COLUMN IF EXISTS tipo_vehiculo;`);

    // 7. sla_config: add tipo_vehiculo_id, drop linea_negocio and tipo_vehiculo
    await queryRunner.query(`ALTER TABLE sla_config ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INTEGER;`);
    await queryRunner.query(`
      UPDATE sla_config SET tipo_vehiculo_id = tv.id
      FROM tipo_vehiculo tv
      WHERE (
        (sla_config.tipo_vehiculo = tv.slug) OR
        (sla_config.tipo_vehiculo = 'Camión' AND tv.slug = 'camion') OR
        (sla_config.tipo_vehiculo = 'Bus' AND tv.slug = 'bus') OR
        (sla_config.tipo_vehiculo = 'Maquinaria' AND tv.slug = 'maquinaria') OR
        (sla_config.tipo_vehiculo = 'Vehículo Ligero' AND tv.slug = 'vehiculo_ligero')
      );
    `);
    await queryRunner.query(`ALTER TABLE sla_config ADD CONSTRAINT fk_sla_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo(id);`);
    await queryRunner.query(`ALTER TABLE sla_config DROP COLUMN IF EXISTS tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE sla_config DROP COLUMN IF EXISTS linea_negocio;`);
    // Update check constraint
    await queryRunner.query(`ALTER TABLE sla_config DROP CONSTRAINT IF EXISTS chk_sla_min_dimension;`);
    await queryRunner.query(`ALTER TABLE sla_config ADD CONSTRAINT chk_sla_min_dimension CHECK (empresa_id IS NOT NULL OR subetapa_id IS NOT NULL OR tipo_vehiculo_id IS NOT NULL);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: restore string columns, drop tipo_vehiculo table
    // sla_config
    await queryRunner.query(`ALTER TABLE sla_config DROP CONSTRAINT IF EXISTS chk_sla_min_dimension;`);
    await queryRunner.query(`ALTER TABLE sla_config ADD COLUMN linea_negocio VARCHAR(100);`);
    await queryRunner.query(`ALTER TABLE sla_config ADD COLUMN tipo_vehiculo VARCHAR(100);`);
    await queryRunner.query(`ALTER TABLE sla_config DROP CONSTRAINT IF EXISTS fk_sla_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE sla_config DROP COLUMN tipo_vehiculo_id;`);
    await queryRunner.query(`ALTER TABLE sla_config ADD CONSTRAINT chk_sla_min_dimension CHECK (empresa_id IS NOT NULL OR subetapa_id IS NOT NULL OR linea_negocio IS NOT NULL OR tipo_vehiculo IS NOT NULL);`);

    // subetapa_config
    await queryRunner.query(`ALTER TABLE subetapa_config ADD COLUMN tipo_vehiculo VARCHAR(100);`);
    await queryRunner.query(`ALTER TABLE subetapa_config DROP CONSTRAINT IF EXISTS fk_sc_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE subetapa_config DROP COLUMN tipo_vehiculo_id;`);

    // subetapa_tipo_vehiculo
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo DROP CONSTRAINT IF EXISTS uq_subetapa_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo ADD COLUMN tipo_vehiculo VARCHAR NOT NULL DEFAULT '';`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo DROP CONSTRAINT IF EXISTS fk_stv_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo DROP COLUMN tipo_vehiculo_id;`);
    await queryRunner.query(`ALTER TABLE subetapa_tipo_vehiculo ADD CONSTRAINT uq_subetapa_tipo_vehiculo UNIQUE (subetapa_id, tipo_vehiculo);`);

    // hito_tipo_vehiculo
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo DROP CONSTRAINT IF EXISTS uq_hito_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo ADD COLUMN tipo_vehiculo VARCHAR NOT NULL DEFAULT '';`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo DROP CONSTRAINT IF EXISTS fk_htv_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo DROP COLUMN tipo_vehiculo_id;`);
    await queryRunner.query(`ALTER TABLE hito_tipo_vehiculo ADD CONSTRAINT uq_hito_tipo_vehiculo UNIQUE (hito_id, tipo_vehiculo);`);

    // vin
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vin_tipo_vehiculo_id;`);
    await queryRunner.query(`ALTER TABLE vin ADD COLUMN tipo_vehiculo VARCHAR(100);`);
    await queryRunner.query(`ALTER TABLE vin DROP CONSTRAINT IF EXISTS fk_vin_tipo_vehiculo;`);
    await queryRunner.query(`ALTER TABLE vin DROP COLUMN tipo_vehiculo_id;`);
    await queryRunner.query(`CREATE INDEX idx_vin_tipo_vehiculo ON vin(tipo_vehiculo);`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS tipo_vehiculo;`);
  }
}
