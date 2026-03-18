import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFuentesYMapeoCamposVin1774600000000 implements MigrationInterface {
  name = 'CreateFuentesYMapeoCamposVin1774600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fuentes_vin',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'tipo_fuente', type: 'varchar', length: '50' },
          { name: 'ruta_patron', type: 'varchar', length: '200' },
          { name: 'columna_vin', type: 'varchar', length: '100' },
          { name: 'activo', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'mapeo_campos_vin',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'nombre_campo', type: 'varchar', length: '100' },
          { name: 'id_fuente', type: 'int' },
          { name: 'nombre_columna_fuente', type: 'varchar', length: '150' },
          { name: 'prioridad', type: 'int', default: 1 },
          { name: 'activo', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'mapeo_campos_vin',
      new TableForeignKey({
        columnNames: ['id_fuente'],
        referencedColumnNames: ['id'],
        referencedTableName: 'fuentes_vin',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('mapeo_campos_vin');
    const fk = table?.foreignKeys.find((fk) => fk.columnNames.includes('id_fuente'));
    if (fk) await queryRunner.dropForeignKey('mapeo_campos_vin', fk);
    await queryRunner.dropTable('mapeo_campos_vin');
    await queryRunner.dropTable('fuentes_vin');
  }
}
