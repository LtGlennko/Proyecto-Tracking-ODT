import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MapeoCampoVin } from '../mapeo-campos-vin/mapeo-campo-vin.entity';

@Entity('fuentes_vin')
export class FuenteVin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo_fuente', type: 'varchar', length: 50 })
  tipoFuente: string;

  @Column({ name: 'ruta_patron', type: 'varchar', length: 200 })
  rutaPatron: string;

  @Column({ name: 'columna_vin', type: 'varchar', length: 100 })
  columnaVin: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => MapeoCampoVin, (mapeo) => mapeo.fuente)
  mapeos: MapeoCampoVin[];
}
