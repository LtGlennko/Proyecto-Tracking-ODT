import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Restructure: hito & subetapa become pure master tables.
 * New config tables define orden, activo, grupo_paralelo per tipo_vehiculo.
 * Vehicle types: camion, bus, maquinaria, vehiculo_ligero, leasing
 */
export class HitoSubetapaPorTipoVehiculo1773600000000 implements MigrationInterface {
    name = 'HitoSubetapaPorTipoVehiculo1773600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create hito_tipo_vehiculo config table
        await queryRunner.query(`
            CREATE TABLE "hito_tipo_vehiculo" (
                "id" SERIAL NOT NULL,
                "hito_id" integer NOT NULL,
                "tipo_vehiculo" character varying NOT NULL,
                "grupo_paralelo_id" integer,
                "orden" integer NOT NULL DEFAULT 0,
                "activo" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_hito_tipo_vehiculo" UNIQUE ("hito_id", "tipo_vehiculo"),
                CONSTRAINT "PK_hito_tipo_vehiculo" PRIMARY KEY ("id"),
                CONSTRAINT "FK_htv_hito" FOREIGN KEY ("hito_id") REFERENCES "hito"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_htv_grupo" FOREIGN KEY ("grupo_paralelo_id") REFERENCES "grupo_paralelo"("id") ON DELETE SET NULL
            )
        `);

        // 2. Create subetapa_tipo_vehiculo config table
        await queryRunner.query(`
            CREATE TABLE "subetapa_tipo_vehiculo" (
                "id" SERIAL NOT NULL,
                "subetapa_id" integer NOT NULL,
                "tipo_vehiculo" character varying NOT NULL,
                "orden" integer NOT NULL DEFAULT 0,
                "activo" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_subetapa_tipo_vehiculo" UNIQUE ("subetapa_id", "tipo_vehiculo"),
                CONSTRAINT "PK_subetapa_tipo_vehiculo" PRIMARY KEY ("id"),
                CONSTRAINT "FK_stv_subetapa" FOREIGN KEY ("subetapa_id") REFERENCES "subetapa"("id") ON DELETE CASCADE
            )
        `);

        // 3. Clean hito master first (nullify FKs before deleting referenced rows)
        await queryRunner.query(`
            UPDATE "hito" SET
                "grupo_paralelo_id" = NULL,
                "orden" = NULL,
                "activo" = NULL,
                "tipo_vehiculo" = NULL,
                "usuario_responsable_id" = NULL
        `);

        // 4. Clean grupo_paralelo: keep only 2 logical groups
        await queryRunner.query(`
            UPDATE "grupo_paralelo" SET
                "nombre" = CASE "id"
                    WHEN 1 THEN 'Secuencial'
                    WHEN 2 THEN 'Paralelo Financiero-Operativo'
                    ELSE "nombre"
                END,
                "descripcion" = CASE "id"
                    WHEN 1 THEN 'Hitos que se ejecutan en secuencia'
                    WHEN 2 THEN 'Bloque paralelo: PDI, Crédito, Facturación, Pago'
                    ELSE "descripcion"
                END
            WHERE "id" IN (1, 2)
        `);
        await queryRunner.query(`DELETE FROM "grupo_paralelo" WHERE "id" > 2`);

        // 5. Clean subetapa master: remove config columns
        await queryRunner.query(`
            UPDATE "subetapa" SET "orden" = NULL, "activo_default" = NULL
        `);

        // 6. Seed hito_tipo_vehiculo for all 5 types
        // Default config: all hitos active for all types
        // PDI(3), Crédito(4), Facturación(5), Pago(6) → grupo_paralelo 2 (paralelo)
        // Rest → grupo_paralelo 1 (secuencial)
        const tipos = ['camion', 'bus', 'maquinaria', 'vehiculo_ligero', 'leasing'];
        const hitoConfigs = [
            { hitoId: 1, orden: 1, grupoId: 1 },   // Importación
            { hitoId: 2, orden: 2, grupoId: 1 },   // Asignación
            { hitoId: 3, orden: 3, grupoId: 2 },   // PDI (paralelo)
            { hitoId: 4, orden: 4, grupoId: 2 },   // Crédito (paralelo)
            { hitoId: 5, orden: 5, grupoId: 2 },   // Facturación (paralelo)
            { hitoId: 6, orden: 6, grupoId: 2 },   // Pago (paralelo)
            { hitoId: 7, orden: 7, grupoId: 1 },   // Inmatriculación
            { hitoId: 8, orden: 8, grupoId: 1 },   // Programación
            { hitoId: 9, orden: 9, grupoId: 1 },   // Entrega
        ];

        const hitoValues = tipos.flatMap(tipo =>
            hitoConfigs.map(hc => `(${hc.hitoId}, '${tipo}', ${hc.grupoId}, ${hc.orden}, true)`)
        ).join(',\n            ');

        await queryRunner.query(`
            INSERT INTO "hito_tipo_vehiculo" ("hito_id", "tipo_vehiculo", "grupo_paralelo_id", "orden", "activo")
            VALUES ${hitoValues}
            ON CONFLICT ("hito_id", "tipo_vehiculo") DO UPDATE SET
                "grupo_paralelo_id" = EXCLUDED."grupo_paralelo_id",
                "orden" = EXCLUDED."orden",
                "activo" = EXCLUDED."activo"
        `);

        // 7. Seed subetapa_tipo_vehiculo for all 5 types
        // subetapa IDs 1-21 as seeded previously
        const subConfigs = [
            // Importación subs
            { subId: 1, orden: 1 }, { subId: 2, orden: 2 }, { subId: 3, orden: 3 },
            { subId: 4, orden: 4 }, { subId: 5, orden: 5 }, { subId: 6, orden: 6 },
            { subId: 7, orden: 7 },
            // Asignación subs
            { subId: 8, orden: 1 }, { subId: 9, orden: 2 },
            // PDI subs
            { subId: 10, orden: 1 }, { subId: 11, orden: 2 }, { subId: 12, orden: 3 },
            // Crédito subs
            { subId: 13, orden: 1 }, { subId: 14, orden: 2 },
            // Facturación subs
            { subId: 15, orden: 1 },
            // Pago subs
            { subId: 16, orden: 1 },
            // Inmatriculación subs
            { subId: 17, orden: 1 }, { subId: 18, orden: 2 },
            // Programación subs
            { subId: 19, orden: 1 }, { subId: 20, orden: 2 },
            // Entrega subs
            { subId: 21, orden: 1 },
        ];

        const subValues = tipos.flatMap(tipo =>
            subConfigs.map(sc => `(${sc.subId}, '${tipo}', ${sc.orden}, true)`)
        ).join(',\n            ');

        await queryRunner.query(`
            INSERT INTO "subetapa_tipo_vehiculo" ("subetapa_id", "tipo_vehiculo", "orden", "activo")
            VALUES ${subValues}
            ON CONFLICT ("subetapa_id", "tipo_vehiculo") DO UPDATE SET
                "orden" = EXCLUDED."orden",
                "activo" = EXCLUDED."activo"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "subetapa_tipo_vehiculo"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "hito_tipo_vehiculo"`);
    }
}
