import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInmatriculacionColumnsToStagingVin1774700000000 implements MigrationInterface {
  name = 'AddInmatriculacionColumnsToStagingVin1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('staging_vin', [
      // Inmatriculación — proceso
      new TableColumn({ name: 'situacion_inmatric', type: 'varchar', length: '100', isNullable: true }),
      new TableColumn({ name: 'fecha_inicio_inmatric', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_titulo', type: 'date', isNullable: true }),
      new TableColumn({ name: 'numero_titulo', type: 'varchar', length: '50', isNullable: true }),
      new TableColumn({ name: 'placa', type: 'varchar', length: '20', isNullable: true }),
      new TableColumn({ name: 'fecha_inscrito', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_rep_placa', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_rec_doc_car', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_rec_doc', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_em_doc', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_obs_app', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_cal_sunarp', type: 'date', isNullable: true }),
      new TableColumn({ name: 'oficina_registral', type: 'varchar', length: '100', isNullable: true }),
      new TableColumn({ name: 'fecha_maxima_tramite', type: 'date', isNullable: true }),
      new TableColumn({ name: 'fecha_cancelacion', type: 'date', isNullable: true }),
      new TableColumn({ name: 'folio', type: 'varchar', length: '50', isNullable: true }),
      // Datos complementarios
      new TableColumn({ name: 'clase_operacion', type: 'varchar', length: '50', isNullable: true }),
      new TableColumn({ name: 'color', type: 'varchar', length: '100', isNullable: true }),
      new TableColumn({ name: 'cod_color', type: 'varchar', length: '20', isNullable: true }),
      new TableColumn({ name: 'tapiz', type: 'varchar', length: '100', isNullable: true }),
      new TableColumn({ name: 'cod_tapiz', type: 'varchar', length: '20', isNullable: true }),
      new TableColumn({ name: 'd_canal', type: 'varchar', length: '50', isNullable: true }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cols = [
      'd_canal', 'cod_tapiz', 'tapiz', 'cod_color', 'color', 'clase_operacion',
      'folio', 'fecha_cancelacion', 'fecha_maxima_tramite', 'oficina_registral',
      'fecha_cal_sunarp', 'fecha_obs_app', 'fecha_em_doc', 'fecha_rec_doc',
      'fecha_rec_doc_car', 'fecha_rep_placa', 'fecha_inscrito', 'placa',
      'numero_titulo', 'fecha_titulo', 'fecha_inicio_inmatric', 'situacion_inmatric',
    ];
    for (const col of cols) {
      await queryRunner.dropColumn('staging_vin', col);
    }
  }
}
