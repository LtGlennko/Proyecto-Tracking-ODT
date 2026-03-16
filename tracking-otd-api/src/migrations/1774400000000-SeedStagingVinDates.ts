import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Populates staging_vin with realistic demo dates for the 9 seeded VINs.
 * Dates are derived from vin_subetapa_tracking.fecha_real in SeedTrackingDemoData.
 *
 * Mapping: subetapa.campo_staging_vin → staging_vin column
 * - fecha_colocacion           ← Solicitud negocio (sub 1)
 * - fecha_liberacion_fabrica   ← Producción (sub 3)
 * - fecha_fin_prod_carr_real   ← Carrocero Int'l (sub 4) / En Carrocero Local (sub 11)
 * - fecha_embarque_sap         ← Embarque (sub 5)
 * - fecha_llegada_aduana       ← En aduana (sub 6)
 * - fecha_ingreso_patio        ← En almacén (sub 7)
 * - fecha_preasignacion        ← Reserva (sub 8)
 * - fecha_asignacion           ← Asig. Definitiva (sub 9)
 * - fecha_ingreso_prod_carr_real ← Inicio PDI (sub 10)
 * - fecha_liberado_sap         ← Salida PDI (sub 12)
 * - fecha_facturacion_sap      ← Emisión Factura (sub 15)
 * - fcc                        ← Inicio trámite (sub 17)
 * - fclr                       ← Placas recibidas (sub 18)
 * - fecha_entrega_cliente      ← Entregado al Cliente (sub 21)
 *
 * GAP manuales (sub 13,14,16,19,20) → no staging column, read from vin_subetapa_tracking.fecha_real
 */
export class SeedStagingVinDates1774400000000 implements MigrationInterface {
  name = 'SeedStagingVinDates1774400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // VIN1: WDB9988776655AABC1 — DEMORADO, stuck at PDI (importación+asignación completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fuente_ultima_sync")
      VALUES (
        'WDB9988776655AABC1', 'Actros 2651', 'VC', 'LOTE-2025-A12', 'Juan Pérez', 'OC-00198',
        '2025-10-22', '2025-11-08', '2025-11-10',
        '2025-11-10', '2025-11-18', '2025-11-20',
        '2025-11-21', '2025-11-22',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN2: WDB9988776655AABC2 — A TIEMPO, at inmatriculación (through pago completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fecha_ingreso_prod_carr_real", "fecha_liberado_sap", "fecha_facturacion_sap",
        "fuente_ultima_sync")
      VALUES (
        'WDB9988776655AABC2', 'Atego 1726', 'VC', 'LOTE-2025-A12', 'Juan Pérez', 'OC-00199',
        '2025-10-21', '2025-11-05', '2025-12-06',
        '2025-11-08', '2025-11-15', '2025-11-19',
        '2025-11-20', '2025-11-22',
        '2025-12-01', '2025-12-08', '2025-12-07',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fecha_ingreso_prod_carr_real" = EXCLUDED."fecha_ingreso_prod_carr_real",
        "fecha_liberado_sap" = EXCLUDED."fecha_liberado_sap",
        "fecha_facturacion_sap" = EXCLUDED."fecha_facturacion_sap",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN3: WDBBUS44556601BUS1 — A TIEMPO, at inmatriculación (through pago completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fecha_ingreso_prod_carr_real", "fecha_liberado_sap", "fecha_facturacion_sap",
        "fuente_ultima_sync")
      VALUES (
        'WDBBUS44556601BUS1', 'O 500 RSD', 'Buses', 'LOTE-BUS-01', 'Roberto Gomez', 'OC-00210',
        '2025-11-06', '2025-11-20', '2025-12-30',
        '2025-11-25', '2025-12-02', '2025-12-14',
        '2025-12-16', '2025-12-17',
        '2025-12-26', '2026-01-02', '2026-01-01',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fecha_ingreso_prod_carr_real" = EXCLUDED."fecha_ingreso_prod_carr_real",
        "fecha_liberado_sap" = EXCLUDED."fecha_liberado_sap",
        "fecha_facturacion_sap" = EXCLUDED."fecha_facturacion_sap",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN4: WDBBUS44556602BUS2 — DEMORADO, at crédito (through PDI completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fecha_ingreso_prod_carr_real", "fecha_liberado_sap",
        "fuente_ultima_sync")
      VALUES (
        'WDBBUS44556602BUS2', 'O 500 RSD 2442', 'Buses', 'LOTE-BUS-01', 'Roberto Gomez', 'OC-00211',
        '2025-11-08', '2025-11-22', '2026-01-02',
        '2025-11-28', '2025-12-05', '2025-12-16',
        '2025-12-17', '2025-12-18',
        '2025-12-29', '2026-01-05',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fecha_ingreso_prod_carr_real" = EXCLUDED."fecha_ingreso_prod_carr_real",
        "fecha_liberado_sap" = EXCLUDED."fecha_liberado_sap",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN5: JEEP1C4HJXEG8MW123 — FINALIZADO (all completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fecha_ingreso_prod_carr_real", "fecha_liberado_sap", "fecha_facturacion_sap",
        "fcc", "fclr", "fecha_entrega_cliente",
        "fuente_ultima_sync")
      VALUES (
        'JEEP1C4HJXEG8MW123', 'Commander', 'Autos', 'LOTE-AUTO-03', 'Maria Lopez', 'OC-00220',
        '2025-10-02', '2025-10-15', '2025-11-05',
        '2025-10-18', '2025-10-25', '2025-10-29',
        '2025-10-31', '2025-11-01',
        '2025-11-02', '2025-11-10', '2025-11-06',
        '2025-11-12', '2025-11-15', '2025-11-18',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fecha_ingreso_prod_carr_real" = EXCLUDED."fecha_ingreso_prod_carr_real",
        "fecha_liberado_sap" = EXCLUDED."fecha_liberado_sap",
        "fecha_facturacion_sap" = EXCLUDED."fecha_facturacion_sap",
        "fcc" = EXCLUDED."fcc",
        "fclr" = EXCLUDED."fclr",
        "fecha_entrega_cliente" = EXCLUDED."fecha_entrega_cliente",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN6: WDDXYZ9876512AUTO2 — A TIEMPO, at programación (through inmatriculación completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fecha_ingreso_prod_carr_real", "fecha_liberado_sap", "fecha_facturacion_sap",
        "fcc", "fclr",
        "fuente_ultima_sync")
      VALUES (
        'WDDXYZ9876512AUTO2', 'GLA 200', 'Autos', 'LOTE-AUTO-03', 'Maria Lopez', 'OC-00221',
        '2025-10-03', '2025-10-16', '2025-11-06',
        '2025-10-19', '2025-10-25', '2025-10-30',
        '2025-11-01', '2025-11-02',
        '2025-11-03', '2025-11-11', '2025-11-07',
        '2025-11-13', '2025-11-16',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fecha_ingreso_prod_carr_real" = EXCLUDED."fecha_ingreso_prod_carr_real",
        "fecha_liberado_sap" = EXCLUDED."fecha_liberado_sap",
        "fecha_facturacion_sap" = EXCLUDED."fecha_facturacion_sap",
        "fcc" = EXCLUDED."fcc",
        "fclr" = EXCLUDED."fclr",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN7: RAM1C6RR7LT3MN9876 — A TIEMPO, at PDI+crédito (through asignación completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fuente_ultima_sync")
      VALUES (
        'RAM1C6RR7LT3MN9876', '1500 Laramie', 'Autos', 'LOTE-AUTO-04', 'Maria Lopez', 'OC-00222',
        '2025-10-04', '2025-10-17', '2025-10-20',
        '2025-10-21', '2025-10-28', '2025-10-31',
        '2025-11-01', '2025-11-02',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN8: CATEXC330GC2025MAQ1 — DEMORADO, at PDI (through asignación completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fuente_ultima_sync")
      VALUES (
        'CATEXC330GC2025MAQ1', 'Excavadora 330 GC', 'Maquinarias', 'LOTE-MAQ-01', 'Carlos Ruiz', 'OC-00230',
        '2025-12-13', '2025-12-28', '2026-01-03',
        '2026-01-04', '2026-01-10', '2026-01-12',
        '2026-01-13', '2026-01-14',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);

    // VIN9: WDBBUSLNEA001BUS01 — FINALIZADO (all completed)
    await queryRunner.query(`
      INSERT INTO "staging_vin" ("vin", "modelo_comercial", "linea_negocio", "lote_asignado", "nombre_vendedor", "pedido_interno",
        "fecha_colocacion", "fecha_liberacion_fabrica", "fecha_fin_prod_carr_real",
        "fecha_embarque_sap", "fecha_llegada_aduana", "fecha_ingreso_patio",
        "fecha_preasignacion", "fecha_asignacion",
        "fecha_ingreso_prod_carr_real", "fecha_liberado_sap", "fecha_facturacion_sap",
        "fcc", "fclr", "fecha_entrega_cliente",
        "fuente_ultima_sync")
      VALUES (
        'WDBBUSLNEA001BUS01', 'O 500 RSD 2442', 'Buses', 'LOTE-BUS-02', 'Ana Torres', 'OC-00240',
        '2025-11-16', '2025-11-30', '2025-12-30',
        '2025-12-04', '2025-12-10', '2025-12-14',
        '2025-12-16', '2025-12-17',
        '2025-12-26', '2026-01-02', '2025-12-31',
        '2026-01-03', '2026-01-05', '2026-01-08',
        'SEED')
      ON CONFLICT ("vin") DO UPDATE SET
        "modelo_comercial" = EXCLUDED."modelo_comercial",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "lote_asignado" = EXCLUDED."lote_asignado",
        "nombre_vendedor" = EXCLUDED."nombre_vendedor",
        "pedido_interno" = EXCLUDED."pedido_interno",
        "fecha_colocacion" = EXCLUDED."fecha_colocacion",
        "fecha_liberacion_fabrica" = EXCLUDED."fecha_liberacion_fabrica",
        "fecha_fin_prod_carr_real" = EXCLUDED."fecha_fin_prod_carr_real",
        "fecha_embarque_sap" = EXCLUDED."fecha_embarque_sap",
        "fecha_llegada_aduana" = EXCLUDED."fecha_llegada_aduana",
        "fecha_ingreso_patio" = EXCLUDED."fecha_ingreso_patio",
        "fecha_preasignacion" = EXCLUDED."fecha_preasignacion",
        "fecha_asignacion" = EXCLUDED."fecha_asignacion",
        "fecha_ingreso_prod_carr_real" = EXCLUDED."fecha_ingreso_prod_carr_real",
        "fecha_liberado_sap" = EXCLUDED."fecha_liberado_sap",
        "fecha_facturacion_sap" = EXCLUDED."fecha_facturacion_sap",
        "fcc" = EXCLUDED."fcc",
        "fclr" = EXCLUDED."fclr",
        "fecha_entrega_cliente" = EXCLUDED."fecha_entrega_cliente",
        "fuente_ultima_sync" = EXCLUDED."fuente_ultima_sync"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const vinIds = [
      'WDB9988776655AABC1', 'WDB9988776655AABC2', 'WDBBUS44556601BUS1', 'WDBBUS44556602BUS2',
      'JEEP1C4HJXEG8MW123', 'WDDXYZ9876512AUTO2', 'RAM1C6RR7LT3MN9876', 'CATEXC330GC2025MAQ1',
      'WDBBUSLNEA001BUS01',
    ];
    const inClause = vinIds.map(v => `'${v}'`).join(',');
    await queryRunner.query(`DELETE FROM "staging_vin" WHERE "vin" IN (${inClause})`);
  }
}
