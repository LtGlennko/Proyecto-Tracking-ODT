import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCondPagoToStagingVin1774500000000 implements MigrationInterface {
  name = 'AddCondPagoToStagingVin1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('staging_vin', [
      new TableColumn({
        name: 'cond_pago',
        type: 'varchar',
        length: '10',
        isNullable: true,
      }),
      new TableColumn({
        name: 'descripcion_cond_pago',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('staging_vin', 'descripcion_cond_pago');
    await queryRunner.dropColumn('staging_vin', 'cond_pago');
  }
}
