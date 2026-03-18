import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FuenteVin } from '../fuentes-vin/fuente-vin.entity';

@Entity('mapeo_campos_vin')
export class MapeoCampoVin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_campo', type: 'varchar', length: 100 })
  nombreCampo: string;

  @ManyToOne(() => FuenteVin, (fuente) => fuente.mapeos, { nullable: false })
  @JoinColumn({ name: 'id_fuente' })
  fuente: FuenteVin;

  @Column({ name: 'id_fuente' })
  idFuente: number;

  @Column({ name: 'nombre_columna_fuente', type: 'varchar', length: 150 })
  nombreColumnaFuente: string;

  @Column({ name: 'prioridad', type: 'int', default: 1 })
  prioridad: number;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;
}
