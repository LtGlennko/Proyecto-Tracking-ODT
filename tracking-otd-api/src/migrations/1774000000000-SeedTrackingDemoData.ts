import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds demo data for the tracking module:
 * - Adds ejecutivo column to ficha
 * - Adds orden_compra column to vin
 * - Inserts 5 clientes, 5 fichas, 9 VINs
 * - Inserts vin_hito_tracking (9 per VIN)
 * - Inserts vin_subetapa_tracking (21 per VIN)
 */
export class SeedTrackingDemoData1774000000000 implements MigrationInterface {
  name = 'SeedTrackingDemoData1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Add missing columns ──
    await queryRunner.query(`ALTER TABLE "ficha" ADD COLUMN IF NOT EXISTS "ejecutivo" character varying`);
    await queryRunner.query(`ALTER TABLE "vin" ADD COLUMN IF NOT EXISTS "orden_compra" character varying`);

    // ── 2. Insert clientes ──
    // Empresas already seeded: Divemotor, Andes Motor, Andes Maq
    await queryRunner.query(`
      INSERT INTO "cliente" ("id", "empresa_id", "nombre", "ruc", "is_vic")
      VALUES
        (1, (SELECT id FROM empresa WHERE codigo = 'DIVEMOTOR'),    'Transportes del Norte S.A.',    '20100100100', false),
        (2, (SELECT id FROM empresa WHERE codigo = 'ANDES_MOTOR'),  'Turismo Andes S.A.',            '20200200200', false),
        (3, (SELECT id FROM empresa WHERE codigo = 'DIVEMOTOR'),    'Renting Corporativo S.A.C.',    '20300300300', false),
        (4, (SELECT id FROM empresa WHERE codigo = 'ANDES_MAQ'),    'Constructora del Sur S.A.',     '20400400400', false),
        (5, (SELECT id FROM empresa WHERE codigo = 'ANDES_MOTOR'),  'Transportes Línea S.A.',        '20500500500', true)
      ON CONFLICT ("id") DO UPDATE SET
        "empresa_id" = EXCLUDED."empresa_id",
        "nombre" = EXCLUDED."nombre",
        "ruc" = EXCLUDED."ruc",
        "is_vic" = EXCLUDED."is_vic"
    `);
    await queryRunner.query(`SELECT setval(pg_get_serial_sequence('cliente', 'id'), GREATEST((SELECT MAX(id) FROM cliente), 5))`);

    // ── 3. Insert fichas ──
    await queryRunner.query(`
      INSERT INTO "ficha" ("id", "cliente_id", "codigo", "forma_pago", "fecha_creacion", "ejecutivo")
      VALUES
        (1, 1, 'F-2025-884',     'Leasing',                '2025-10-20', 'Juan Pérez'),
        (2, 2, 'F-2025-999',     'Financiamiento directo', '2025-11-05', 'Roberto Gomez'),
        (3, 3, 'F-2025-901',     'Renting',                '2025-10-01', 'Maria Lopez'),
        (4, 4, 'F-MAQ-2025-01',  'Financiamiento BK',      '2025-12-10', 'Carlos Ruiz'),
        (5, 5, 'F-BUS-2025-02',  'Leasing',                '2025-11-15', 'Ana Torres')
      ON CONFLICT ("id") DO UPDATE SET
        "cliente_id" = EXCLUDED."cliente_id",
        "codigo" = EXCLUDED."codigo",
        "forma_pago" = EXCLUDED."forma_pago",
        "fecha_creacion" = EXCLUDED."fecha_creacion",
        "ejecutivo" = EXCLUDED."ejecutivo"
    `);
    await queryRunner.query(`SELECT setval(pg_get_serial_sequence('ficha', 'id'), GREATEST((SELECT MAX(id) FROM ficha), 5))`);

    // ── 4. Insert VINs ──
    await queryRunner.query(`
      INSERT INTO "vin" ("id", "ficha_id", "marca", "modelo", "linea_negocio", "tipo_vehiculo", "lote", "ejecutivo_sap", "orden_compra", "desviacion_acumulada", "ultima_actualizacion")
      VALUES
        ('WDB9988776655AABC1', 1, 'Mercedes-Benz', 'Actros 2651',         'VC',          'Camión',           'LOTE-2025-A12', 'Juan Pérez',    'OC-00198',  6,  '2025-12-15 10:30:00'),
        ('WDB9988776655AABC2', 1, 'Mercedes-Benz', 'Atego 1726',          'VC',          'Camión',           'LOTE-2025-A12', 'Juan Pérez',    'OC-00199',  0,  '2026-01-20 14:00:00'),
        ('WDBBUS44556601BUS1', 2, 'Mercedes-Benz', 'O 500 RSD',           'Buses',       'Bus',              'LOTE-BUS-01',   'Roberto Gomez', 'OC-00210',  0,  '2026-01-28 09:00:00'),
        ('WDBBUS44556602BUS2', 2, 'Mercedes-Benz', 'O 500 RSD 2442',      'Buses',       'Bus',              'LOTE-BUS-01',   'Roberto Gomez', 'OC-00211',  4,  '2026-01-10 16:00:00'),
        ('JEEP1C4HJXEG8MW123', 3, 'Jeep',          'Commander',            'Autos',       'Vehículo Ligero',  'LOTE-AUTO-03',  'Maria Lopez',   'OC-00220', -2,  '2026-01-05 11:00:00'),
        ('WDDXYZ9876512AUTO2', 3, 'Mercedes-Benz', 'GLA 200',             'Autos',       'Vehículo Ligero',  'LOTE-AUTO-03',  'Maria Lopez',   'OC-00221',  0,  '2026-02-10 08:30:00'),
        ('RAM1C6RR7LT3MN9876', 3, 'RAM',           '1500 Laramie',        'Autos',       'Vehículo Ligero',  'LOTE-AUTO-04',  'Maria Lopez',   'OC-00222',  0,  '2026-01-15 10:00:00'),
        ('CATEXC330GC2025MAQ1', 4, 'CAT',           'Excavadora 330 GC',   'Maquinarias', 'Maquinaria',       'LOTE-MAQ-01',   'Carlos Ruiz',   'OC-00230',  5,  '2026-01-20 15:00:00'),
        ('WDBBUSLNEA001BUS01', 5, 'Mercedes-Benz', 'O 500 RSD 2442',      'Buses',       'Bus',              'LOTE-BUS-02',   'Ana Torres',    'OC-00240',  0,  '2026-02-28 12:00:00')
      ON CONFLICT ("id") DO UPDATE SET
        "ficha_id" = EXCLUDED."ficha_id",
        "marca" = EXCLUDED."marca",
        "modelo" = EXCLUDED."modelo",
        "linea_negocio" = EXCLUDED."linea_negocio",
        "tipo_vehiculo" = EXCLUDED."tipo_vehiculo",
        "lote" = EXCLUDED."lote",
        "ejecutivo_sap" = EXCLUDED."ejecutivo_sap",
        "orden_compra" = EXCLUDED."orden_compra",
        "desviacion_acumulada" = EXCLUDED."desviacion_acumulada",
        "ultima_actualizacion" = EXCLUDED."ultima_actualizacion"
    `);

    // ── 5. Insert vin_hito_tracking ──
    // Hito IDs: 1=Importación, 2=Asignación, 3=PDI, 4=Crédito, 5=Facturación, 6=Pago, 7=Inmatriculación, 8=Programación, 9=Entrega
    // Status: completed, active, delayed, pending
    await queryRunner.query(`
      INSERT INTO "vin_hito_tracking" ("vin_id", "hito_id", "fecha_plan", "fecha_real", "estado")
      VALUES
        -- VIN1: WDB..BC1 DEMORADO, currentStage=pdi
        ('WDB9988776655AABC1', 1, '2025-11-20', '2025-11-20', 'completed'),
        ('WDB9988776655AABC1', 2, '2025-11-22', '2025-11-22', 'completed'),
        ('WDB9988776655AABC1', 3, '2025-12-02', NULL,         'delayed'),
        ('WDB9988776655AABC1', 4, '2025-12-02', NULL,         'pending'),
        ('WDB9988776655AABC1', 5, '2025-12-07', NULL,         'pending'),
        ('WDB9988776655AABC1', 6, '2025-12-07', NULL,         'pending'),
        ('WDB9988776655AABC1', 7, '2025-12-12', NULL,         'pending'),
        ('WDB9988776655AABC1', 8, '2025-12-13', NULL,         'pending'),
        ('WDB9988776655AABC1', 9, '2025-12-15', NULL,         'pending'),

        -- VIN2: WDB..BC2 A TIEMPO, currentStage=inmatriculacion
        ('WDB9988776655AABC2', 1, '2025-11-20', '2025-11-19', 'completed'),
        ('WDB9988776655AABC2', 2, '2025-11-22', '2025-11-22', 'completed'),
        ('WDB9988776655AABC2', 3, '2025-12-02', '2025-12-01', 'completed'),
        ('WDB9988776655AABC2', 4, '2025-12-02', '2025-12-04', 'completed'),
        ('WDB9988776655AABC2', 5, '2025-12-07', '2025-12-07', 'completed'),
        ('WDB9988776655AABC2', 6, '2025-12-07', '2025-12-08', 'completed'),
        ('WDB9988776655AABC2', 7, '2026-01-17', NULL,         'active'),
        ('WDB9988776655AABC2', 8, '2026-01-20', NULL,         'pending'),
        ('WDB9988776655AABC2', 9, '2026-01-22', NULL,         'pending'),

        -- VIN3: BUS1 A TIEMPO, currentStage=inmatriculacion
        ('WDBBUS44556601BUS1', 1, '2025-12-15', '2025-12-14', 'completed'),
        ('WDBBUS44556601BUS1', 2, '2025-12-17', '2025-12-17', 'completed'),
        ('WDBBUS44556601BUS1', 3, '2025-12-27', '2025-12-26', 'completed'),
        ('WDBBUS44556601BUS1', 4, '2025-12-27', '2025-12-28', 'completed'),
        ('WDBBUS44556601BUS1', 5, '2026-01-01', '2026-01-01', 'completed'),
        ('WDBBUS44556601BUS1', 6, '2026-01-01', '2026-01-02', 'completed'),
        ('WDBBUS44556601BUS1', 7, '2026-01-25', NULL,         'active'),
        ('WDBBUS44556601BUS1', 8, '2026-01-28', NULL,         'pending'),
        ('WDBBUS44556601BUS1', 9, '2026-01-30', NULL,         'pending'),

        -- VIN4: BUS2 DEMORADO, currentStage=credito
        ('WDBBUS44556602BUS2', 1, '2025-12-15', '2025-12-16', 'completed'),
        ('WDBBUS44556602BUS2', 2, '2025-12-18', '2025-12-18', 'completed'),
        ('WDBBUS44556602BUS2', 3, '2025-12-28', '2025-12-30', 'completed'),
        ('WDBBUS44556602BUS2', 4, '2025-12-28', NULL,         'delayed'),
        ('WDBBUS44556602BUS2', 5, '2026-01-02', NULL,         'pending'),
        ('WDBBUS44556602BUS2', 6, '2026-01-02', NULL,         'pending'),
        ('WDBBUS44556602BUS2', 7, '2026-01-07', NULL,         'pending'),
        ('WDBBUS44556602BUS2', 8, '2026-01-08', NULL,         'pending'),
        ('WDBBUS44556602BUS2', 9, '2026-01-10', NULL,         'pending'),

        -- VIN5: JEEP FINALIZADO
        ('JEEP1C4HJXEG8MW123', 1, '2025-10-30', '2025-10-29', 'completed'),
        ('JEEP1C4HJXEG8MW123', 2, '2025-11-01', '2025-11-01', 'completed'),
        ('JEEP1C4HJXEG8MW123', 3, '2025-11-11', '2025-11-10', 'completed'),
        ('JEEP1C4HJXEG8MW123', 4, '2025-11-11', '2025-11-12', 'completed'),
        ('JEEP1C4HJXEG8MW123', 5, '2025-11-16', '2025-11-15', 'completed'),
        ('JEEP1C4HJXEG8MW123', 6, '2025-11-16', '2025-11-16', 'completed'),
        ('JEEP1C4HJXEG8MW123', 7, '2025-11-21', '2025-11-20', 'completed'),
        ('JEEP1C4HJXEG8MW123', 8, '2025-11-22', '2025-11-22', 'completed'),
        ('JEEP1C4HJXEG8MW123', 9, '2025-11-24', '2025-11-22', 'completed'),

        -- VIN6: GLA A TIEMPO, currentStage=programacion
        ('WDDXYZ9876512AUTO2', 1, '2025-10-30', '2025-10-30', 'completed'),
        ('WDDXYZ9876512AUTO2', 2, '2025-11-01', '2025-11-02', 'completed'),
        ('WDDXYZ9876512AUTO2', 3, '2025-11-11', '2025-11-11', 'completed'),
        ('WDDXYZ9876512AUTO2', 4, '2025-11-11', '2025-11-13', 'completed'),
        ('WDDXYZ9876512AUTO2', 5, '2025-11-16', '2025-11-16', 'completed'),
        ('WDDXYZ9876512AUTO2', 6, '2025-11-16', '2025-11-17', 'completed'),
        ('WDDXYZ9876512AUTO2', 7, '2025-11-21', '2025-11-21', 'completed'),
        ('WDDXYZ9876512AUTO2', 8, '2026-02-08', NULL,         'active'),
        ('WDDXYZ9876512AUTO2', 9, '2026-02-10', NULL,         'pending'),

        -- VIN7: RAM A TIEMPO, currentStage=credito (parallel with PDI)
        ('RAM1C6RR7LT3MN9876', 1, '2025-10-30', '2025-10-31', 'completed'),
        ('RAM1C6RR7LT3MN9876', 2, '2025-11-02', '2025-11-02', 'completed'),
        ('RAM1C6RR7LT3MN9876', 3, '2025-11-12', NULL,         'active'),
        ('RAM1C6RR7LT3MN9876', 4, '2025-11-12', NULL,         'active'),
        ('RAM1C6RR7LT3MN9876', 5, '2025-11-17', NULL,         'pending'),
        ('RAM1C6RR7LT3MN9876', 6, '2025-11-17', NULL,         'pending'),
        ('RAM1C6RR7LT3MN9876', 7, '2025-11-22', NULL,         'pending'),
        ('RAM1C6RR7LT3MN9876', 8, '2025-11-23', NULL,         'pending'),
        ('RAM1C6RR7LT3MN9876', 9, '2025-11-25', NULL,         'pending'),

        -- VIN8: CAT DEMORADO, currentStage=pdi
        ('CATEXC330GC2025MAQ1', 1, '2026-01-10', '2026-01-12', 'completed'),
        ('CATEXC330GC2025MAQ1', 2, '2026-01-14', '2026-01-14', 'completed'),
        ('CATEXC330GC2025MAQ1', 3, '2026-01-24', NULL,         'delayed'),
        ('CATEXC330GC2025MAQ1', 4, '2026-01-24', NULL,         'pending'),
        ('CATEXC330GC2025MAQ1', 5, '2026-01-29', NULL,         'pending'),
        ('CATEXC330GC2025MAQ1', 6, '2026-01-29', NULL,         'pending'),
        ('CATEXC330GC2025MAQ1', 7, '2026-02-03', NULL,         'pending'),
        ('CATEXC330GC2025MAQ1', 8, '2026-02-04', NULL,         'pending'),
        ('CATEXC330GC2025MAQ1', 9, '2026-02-06', NULL,         'pending'),

        -- VIN9: BUS Línea FINALIZADO
        ('WDBBUSLNEA001BUS01', 1, '2025-12-15', '2025-12-14', 'completed'),
        ('WDBBUSLNEA001BUS01', 2, '2025-12-17', '2025-12-17', 'completed'),
        ('WDBBUSLNEA001BUS01', 3, '2025-12-27', '2025-12-26', 'completed'),
        ('WDBBUSLNEA001BUS01', 4, '2025-12-27', '2025-12-27', 'completed'),
        ('WDBBUSLNEA001BUS01', 5, '2026-01-01', '2025-12-31', 'completed'),
        ('WDBBUSLNEA001BUS01', 6, '2026-01-01', '2026-01-01', 'completed'),
        ('WDBBUSLNEA001BUS01', 7, '2026-01-06', '2026-01-05', 'completed'),
        ('WDBBUSLNEA001BUS01', 8, '2026-01-07', '2026-01-07', 'completed'),
        ('WDBBUSLNEA001BUS01', 9, '2026-01-09', '2026-01-08', 'completed')
    `);

    // ── 6. Insert vin_subetapa_tracking ──
    // Subetapa IDs: 1-7=Importación, 8-9=Asignación, 10-12=PDI, 13-14=Crédito,
    //               15=Facturación, 16=Pago, 17-18=Inmatriculación, 19-20=Programación, 21=Entrega
    const vins = [
      {
        id: 'WDB9988776655AABC1',
        // completed: imp, asig | delayed: pdi | pending: rest
        subs: [
          [1,  'completed', '2025-10-22', '2025-10-22'], [2,  'completed', '2025-10-24', '2025-10-24'],
          [3,  'completed', '2025-10-29', '2025-11-08'], [4,  'completed', '2025-11-08', '2025-11-10'],
          [5,  'completed', '2025-11-10', '2025-11-10'], [6,  'completed', '2025-11-15', '2025-11-18'],
          [7,  'completed', '2025-11-20', '2025-11-20'],
          [8,  'completed', '2025-11-20', '2025-11-21'], [9,  'completed', '2025-11-22', '2025-11-22'],
          [10, 'active',    '2025-12-02', null], [11, 'pending',   '2025-12-04', null], [12, 'pending',   '2025-12-08', null],
          [13, 'pending',   '2025-12-02', null], [14, 'pending',   '2025-12-05', null],
          [15, 'pending',   '2025-12-07', null], [16, 'pending',   '2025-12-07', null],
          [17, 'pending',   '2025-12-08', null], [18, 'pending',   '2025-12-12', null],
          [19, 'pending',   '2025-12-13', null], [20, 'pending',   '2025-12-13', null],
          [21, 'pending',   '2025-12-15', null],
        ],
      },
      {
        id: 'WDB9988776655AABC2',
        subs: [
          [1,  'completed', '2025-10-22', '2025-10-21'], [2,  'completed', '2025-10-24', '2025-10-24'],
          [3,  'completed', '2025-10-29', '2025-11-05'], [4,  'completed', '2025-11-05', '2025-11-08'],
          [5,  'completed', '2025-11-08', '2025-11-08'], [6,  'completed', '2025-11-13', '2025-11-15'],
          [7,  'completed', '2025-11-19', '2025-11-19'],
          [8,  'completed', '2025-11-20', '2025-11-20'], [9,  'completed', '2025-11-22', '2025-11-22'],
          [10, 'completed', '2025-12-02', '2025-12-01'], [11, 'completed', '2025-12-04', '2025-12-06'], [12, 'completed', '2025-12-08', '2025-12-08'],
          [13, 'completed', '2025-12-02', '2025-12-02'], [14, 'completed', '2025-12-04', '2025-12-04'],
          [15, 'completed', '2025-12-07', '2025-12-07'], [16, 'completed', '2025-12-07', '2025-12-08'],
          [17, 'active',    '2026-01-17', null], [18, 'pending',   '2026-01-20', null],
          [19, 'pending',   '2026-01-20', null], [20, 'pending',   '2026-01-20', null],
          [21, 'pending',   '2026-01-22', null],
        ],
      },
      {
        id: 'WDBBUS44556601BUS1',
        subs: [
          [1,  'completed', '2025-11-07', '2025-11-06'], [2,  'completed', '2025-11-09', '2025-11-09'],
          [3,  'completed', '2025-11-14', '2025-11-20'], [4,  'completed', '2025-11-20', '2025-11-25'],
          [5,  'completed', '2025-11-25', '2025-11-25'], [6,  'completed', '2025-11-30', '2025-12-02'],
          [7,  'completed', '2025-12-15', '2025-12-14'],
          [8,  'completed', '2025-12-15', '2025-12-16'], [9,  'completed', '2025-12-17', '2025-12-17'],
          [10, 'completed', '2025-12-27', '2025-12-26'], [11, 'completed', '2025-12-29', '2025-12-30'], [12, 'completed', '2026-01-02', '2026-01-02'],
          [13, 'completed', '2025-12-27', '2025-12-27'], [14, 'completed', '2025-12-29', '2025-12-28'],
          [15, 'completed', '2026-01-01', '2026-01-01'], [16, 'completed', '2026-01-01', '2026-01-02'],
          [17, 'active',    '2026-01-25', null], [18, 'pending',   '2026-01-28', null],
          [19, 'pending',   '2026-01-28', null], [20, 'pending',   '2026-01-28', null],
          [21, 'pending',   '2026-01-30', null],
        ],
      },
      {
        id: 'WDBBUS44556602BUS2',
        subs: [
          [1,  'completed', '2025-11-07', '2025-11-08'], [2,  'completed', '2025-11-09', '2025-11-10'],
          [3,  'completed', '2025-11-14', '2025-11-22'], [4,  'completed', '2025-11-22', '2025-11-27'],
          [5,  'completed', '2025-11-27', '2025-11-28'], [6,  'completed', '2025-12-02', '2025-12-05'],
          [7,  'completed', '2025-12-15', '2025-12-16'],
          [8,  'completed', '2025-12-16', '2025-12-17'], [9,  'completed', '2025-12-18', '2025-12-18'],
          [10, 'completed', '2025-12-28', '2025-12-29'], [11, 'completed', '2025-12-30', '2026-01-02'], [12, 'completed', '2026-01-03', '2026-01-05'],
          [13, 'active',    '2025-12-28', null], [14, 'pending',   '2025-12-31', null],
          [15, 'pending',   '2026-01-02', null], [16, 'pending',   '2026-01-02', null],
          [17, 'pending',   '2026-01-07', null], [18, 'pending',   '2026-01-10', null],
          [19, 'pending',   '2026-01-08', null], [20, 'pending',   '2026-01-08', null],
          [21, 'pending',   '2026-01-10', null],
        ],
      },
      {
        id: 'JEEP1C4HJXEG8MW123',
        subs: [
          [1,  'completed', '2025-10-03', '2025-10-02'], [2,  'completed', '2025-10-05', '2025-10-05'],
          [3,  'completed', '2025-10-10', '2025-10-15'], [4,  'completed', '2025-10-15', '2025-10-18'],
          [5,  'completed', '2025-10-18', '2025-10-18'], [6,  'completed', '2025-10-23', '2025-10-25'],
          [7,  'completed', '2025-10-30', '2025-10-29'],
          [8,  'completed', '2025-10-30', '2025-10-31'], [9,  'completed', '2025-11-01', '2025-11-01'],
          [10, 'completed', '2025-11-01', '2025-11-02'], [11, 'completed', '2025-11-03', '2025-11-05'], [12, 'completed', '2025-11-07', '2025-11-10'],
          [13, 'completed', '2025-11-01', '2025-11-03'], [14, 'completed', '2025-11-03', '2025-11-05'],
          [15, 'completed', '2025-11-06', '2025-11-06'], [16, 'completed', '2025-11-06', '2025-11-07'],
          [17, 'completed', '2025-11-11', '2025-11-12'], [18, 'completed', '2025-11-15', '2025-11-15'],
          [19, 'completed', '2025-11-16', '2025-11-17'], [20, 'completed', '2025-11-17', '2025-11-18'],
          [21, 'completed', '2025-11-20', '2025-11-18'],
        ],
      },
      {
        id: 'WDDXYZ9876512AUTO2',
        subs: [
          [1,  'completed', '2025-10-03', '2025-10-03'], [2,  'completed', '2025-10-05', '2025-10-06'],
          [3,  'completed', '2025-10-10', '2025-10-16'], [4,  'completed', '2025-10-16', '2025-10-18'],
          [5,  'completed', '2025-10-18', '2025-10-19'], [6,  'completed', '2025-10-23', '2025-10-25'],
          [7,  'completed', '2025-10-30', '2025-10-30'],
          [8,  'completed', '2025-10-31', '2025-11-01'], [9,  'completed', '2025-11-01', '2025-11-02'],
          [10, 'completed', '2025-11-02', '2025-11-03'], [11, 'completed', '2025-11-04', '2025-11-06'], [12, 'completed', '2025-11-08', '2025-11-11'],
          [13, 'completed', '2025-11-02', '2025-11-04'], [14, 'completed', '2025-11-04', '2025-11-06'],
          [15, 'completed', '2025-11-07', '2025-11-07'], [16, 'completed', '2025-11-07', '2025-11-08'],
          [17, 'completed', '2025-11-12', '2025-11-13'], [18, 'completed', '2025-11-16', '2025-11-16'],
          [19, 'active',    '2026-02-08', null], [20, 'pending',   '2026-02-08', null],
          [21, 'pending',   '2026-02-10', null],
        ],
      },
      {
        id: 'RAM1C6RR7LT3MN9876',
        subs: [
          [1,  'completed', '2025-10-03', '2025-10-04'], [2,  'completed', '2025-10-05', '2025-10-06'],
          [3,  'completed', '2025-10-10', '2025-10-17'], [4,  'completed', '2025-10-17', '2025-10-20'],
          [5,  'completed', '2025-10-20', '2025-10-21'], [6,  'completed', '2025-10-25', '2025-10-28'],
          [7,  'completed', '2025-10-30', '2025-10-31'],
          [8,  'completed', '2025-10-31', '2025-11-01'], [9,  'completed', '2025-11-02', '2025-11-02'],
          [10, 'active',    '2025-11-12', null], [11, 'pending',   '2025-11-14', null], [12, 'pending',   '2025-11-18', null],
          [13, 'active',    '2025-11-12', null], [14, 'pending',   '2025-11-14', null],
          [15, 'pending',   '2025-11-17', null], [16, 'pending',   '2025-11-17', null],
          [17, 'pending',   '2025-11-18', null], [18, 'pending',   '2025-11-22', null],
          [19, 'pending',   '2025-11-23', null], [20, 'pending',   '2025-11-23', null],
          [21, 'pending',   '2025-11-25', null],
        ],
      },
      {
        id: 'CATEXC330GC2025MAQ1',
        subs: [
          [1,  'completed', '2025-12-12', '2025-12-13'], [2,  'completed', '2025-12-14', '2025-12-15'],
          [3,  'completed', '2025-12-19', '2025-12-28'], [4,  'completed', '2025-12-28', '2026-01-03'],
          [5,  'completed', '2026-01-03', '2026-01-04'], [6,  'completed', '2026-01-08', '2026-01-10'],
          [7,  'completed', '2026-01-10', '2026-01-12'],
          [8,  'completed', '2026-01-12', '2026-01-13'], [9,  'completed', '2026-01-14', '2026-01-14'],
          [10, 'active',    '2026-01-24', null], [11, 'pending',   '2026-01-26', null], [12, 'pending',   '2026-01-30', null],
          [13, 'pending',   '2026-01-24', null], [14, 'pending',   '2026-01-27', null],
          [15, 'pending',   '2026-01-29', null], [16, 'pending',   '2026-01-29', null],
          [17, 'pending',   '2026-01-30', null], [18, 'pending',   '2026-02-03', null],
          [19, 'pending',   '2026-02-04', null], [20, 'pending',   '2026-02-04', null],
          [21, 'pending',   '2026-02-06', null],
        ],
      },
      {
        id: 'WDBBUSLNEA001BUS01',
        subs: [
          [1,  'completed', '2025-11-17', '2025-11-16'], [2,  'completed', '2025-11-19', '2025-11-19'],
          [3,  'completed', '2025-11-24', '2025-11-30'], [4,  'completed', '2025-11-30', '2025-12-04'],
          [5,  'completed', '2025-12-04', '2025-12-04'], [6,  'completed', '2025-12-09', '2025-12-10'],
          [7,  'completed', '2025-12-15', '2025-12-14'],
          [8,  'completed', '2025-12-15', '2025-12-16'], [9,  'completed', '2025-12-17', '2025-12-17'],
          [10, 'completed', '2025-12-27', '2025-12-26'], [11, 'completed', '2025-12-29', '2025-12-30'], [12, 'completed', '2026-01-02', '2026-01-02'],
          [13, 'completed', '2025-12-27', '2025-12-27'], [14, 'completed', '2025-12-29', '2025-12-28'],
          [15, 'completed', '2025-12-31', '2025-12-31'], [16, 'completed', '2026-01-01', '2026-01-01'],
          [17, 'completed', '2026-01-02', '2026-01-03'], [18, 'completed', '2026-01-05', '2026-01-05'],
          [19, 'completed', '2026-01-06', '2026-01-06'], [20, 'completed', '2026-01-07', '2026-01-07'],
          [21, 'completed', '2026-01-08', '2026-01-08'],
        ],
      },
    ];

    for (const vin of vins) {
      const values = vin.subs
        .map(([subId, estado, plan, real]) =>
          `('${vin.id}', ${subId}, '${plan}', ${real ? `'${real}'` : 'NULL'}, '${estado}')`,
        )
        .join(',\n        ');

      await queryRunner.query(`
        INSERT INTO "vin_subetapa_tracking" ("vin_id", "subetapa_id", "fecha_plan", "fecha_real", "estado")
        VALUES ${values}
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const vinIds = [
      'WDB9988776655AABC1', 'WDB9988776655AABC2', 'WDBBUS44556601BUS1', 'WDBBUS44556602BUS2',
      'JEEP1C4HJXEG8MW123', 'WDDXYZ9876512AUTO2', 'RAM1C6RR7LT3MN9876', 'CATEXC330GC2025MAQ1',
      'WDBBUSLNEA001BUS01',
    ];
    const inClause = vinIds.map(v => `'${v}'`).join(',');

    await queryRunner.query(`DELETE FROM "vin_subetapa_tracking" WHERE "vin_id" IN (${inClause})`);
    await queryRunner.query(`DELETE FROM "vin_hito_tracking" WHERE "vin_id" IN (${inClause})`);
    await queryRunner.query(`DELETE FROM "vin" WHERE "id" IN (${inClause})`);
    await queryRunner.query(`DELETE FROM "ficha" WHERE "id" BETWEEN 1 AND 5`);
    await queryRunner.query(`DELETE FROM "cliente" WHERE "id" BETWEEN 1 AND 5`);
    await queryRunner.query(`ALTER TABLE "vin" DROP COLUMN IF EXISTS "orden_compra"`);
    await queryRunner.query(`ALTER TABLE "ficha" DROP COLUMN IF EXISTS "ejecutivo"`);
  }
}
