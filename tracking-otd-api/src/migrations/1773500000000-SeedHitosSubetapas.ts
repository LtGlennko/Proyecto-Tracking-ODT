import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedHitosSubetapas1773500000000 implements MigrationInterface {
    name = 'SeedHitosSubetapas1773500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add campo_staging_vin column to subetapa
        await queryRunner.query(`ALTER TABLE "subetapa" ADD COLUMN IF NOT EXISTS "campo_staging_vin" character varying`);

        // 2. Seed grupos paralelos
        await queryRunner.query(`
            INSERT INTO "grupo_paralelo" ("id", "nombre", "orden_global", "descripcion")
            VALUES
                (1, 'Importación',      1, 'Proceso de importación del vehículo'),
                (2, 'Asignación',       2, 'Asignación del vehículo al cliente'),
                (3, 'Paralelo Fin-Op',  3, 'Bloque paralelo: PDI + Crédito + Facturación + Pago'),
                (4, 'Inmatriculación',  4, 'Trámite de inmatriculación'),
                (5, 'Programación',     5, 'Programación de la entrega'),
                (6, 'Entrega',          6, 'Entrega al cliente')
            ON CONFLICT ("id") DO UPDATE SET
                "nombre" = EXCLUDED."nombre",
                "orden_global" = EXCLUDED."orden_global",
                "descripcion" = EXCLUDED."descripcion"
        `);

        // Reset sequence
        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('grupo_paralelo', 'id'), (SELECT MAX(id) FROM grupo_paralelo))`);

        // 3. Seed hitos (9 hitos matching the front-end constants)
        await queryRunner.query(`
            INSERT INTO "hito" ("id", "grupo_paralelo_id", "nombre", "carril", "orden", "activo")
            VALUES
                (1, 1, 'Importación',      'operativo',   1, true),
                (2, 2, 'Asignación',       'comercial',   2, true),
                (3, 3, 'PDI',              'operativo',   3, true),
                (4, 3, 'Crédito',          'financiero',  4, true),
                (5, 3, 'Facturación',      'financiero',  5, true),
                (6, 3, 'Pago',             'financiero',  6, true),
                (7, 4, 'Inmatriculación',  'operativo',   7, true),
                (8, 5, 'Programación',     'operativo',   8, true),
                (9, 6, 'Entrega',          'comercial',   9, true)
            ON CONFLICT ("id") DO UPDATE SET
                "grupo_paralelo_id" = EXCLUDED."grupo_paralelo_id",
                "nombre" = EXCLUDED."nombre",
                "carril" = EXCLUDED."carril",
                "orden" = EXCLUDED."orden",
                "activo" = EXCLUDED."activo"
        `);

        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('hito', 'id'), (SELECT MAX(id) FROM hito))`);

        // 4. Seed subetapas with campo_staging_vin mapping
        // campo_staging_vin = exact column name in staging_vin table, NULL = GAP manual
        await queryRunner.query(`
            INSERT INTO "subetapa" ("id", "hito_id", "nombre", "categoria", "orden", "activo_default", "campo_staging_vin")
            VALUES
                -- Importación (hito 1)
                (1,  1, 'Solicitud negocio',       'COMEX',      1, true, 'fecha_colocacion'),
                (2,  1, 'Pedido fábrica',           'COMEX',      2, true, 'fecha_colocacion'),
                (3,  1, 'Producción',               'COMEX',      3, true, 'fecha_liberacion_fabrica'),
                (4,  1, 'Carrocero Internacional',  'COMEX',      4, true, 'fecha_fin_prod_carr_real'),
                (5,  1, 'Embarque',                 'COMEX',      5, true, 'fecha_embarque_sap'),
                (6,  1, 'En aduana',                'COMEX',      6, true, 'fecha_llegada_aduana'),
                (7,  1, 'En almacén',               'LOGISTICA',  7, true, 'fecha_ingreso_patio'),

                -- Asignación (hito 2)
                (8,  2, 'Reserva',              'COMERCIAL', 1, true, 'fecha_preasignacion'),
                (9,  2, 'Asig. Definitiva',     'COMERCIAL', 2, true, 'fecha_asignacion'),

                -- PDI (hito 3)
                (10, 3, 'Inicio PDI',           'LOGISTICA', 1, true, 'fecha_ingreso_prod_carr_real'),
                (11, 3, 'En Carrocero Local',   'LOGISTICA', 2, true, 'fecha_fin_prod_carr_real'),
                (12, 3, 'Salida PDI',           'LOGISTICA', 3, true, 'fecha_liberado_sap'),

                -- Crédito (hito 4)
                (13, 4, 'Solicitud crédito',    'COMERCIAL', 1, true, NULL),
                (14, 4, 'Aprobación',           'COMERCIAL', 2, true, NULL),

                -- Facturación (hito 5)
                (15, 5, 'Emisión Factura',      'COMERCIAL', 1, true, 'fecha_facturacion_sap'),

                -- Pago (hito 6)
                (16, 6, 'Pago Confirmado',      'COMERCIAL', 1, true, NULL),

                -- Inmatriculación (hito 7)
                (17, 7, 'Inicio trámite',       'LOGISTICA', 1, true, 'fcc'),
                (18, 7, 'Placas recibidas',     'LOGISTICA', 2, true, 'fclr'),

                -- Programación (hito 8)
                (19, 8, 'Unidad Lista',         'LOGISTICA', 1, true, NULL),
                (20, 8, 'Cita Agendada',        'COMERCIAL', 2, true, NULL),

                -- Entrega (hito 9)
                (21, 9, 'Entregado al Cliente', 'COMERCIAL', 1, true, 'fecha_entrega_cliente')
            ON CONFLICT ("id") DO UPDATE SET
                "hito_id" = EXCLUDED."hito_id",
                "nombre" = EXCLUDED."nombre",
                "categoria" = EXCLUDED."categoria",
                "orden" = EXCLUDED."orden",
                "activo_default" = EXCLUDED."activo_default",
                "campo_staging_vin" = EXCLUDED."campo_staging_vin"
        `);

        await queryRunner.query(`SELECT setval(pg_get_serial_sequence('subetapa', 'id'), (SELECT MAX(id) FROM subetapa))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove seeded data (reverse order)
        await queryRunner.query(`DELETE FROM "subetapa" WHERE "id" BETWEEN 1 AND 21`);
        await queryRunner.query(`DELETE FROM "hito" WHERE "id" BETWEEN 1 AND 9`);
        await queryRunner.query(`DELETE FROM "grupo_paralelo" WHERE "id" BETWEEN 1 AND 6`);
        await queryRunner.query(`ALTER TABLE "subetapa" DROP COLUMN IF EXISTS "campo_staging_vin"`);
    }
}
