import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Subetapa } from './subetapa.entity';
import { TipoVehiculo } from '../tipo-vehiculo/tipo-vehiculo.entity';

@Entity('subetapa_tipo_vehiculo')
@Unique(['subetapaId', 'tipoVehiculoId'])
export class SubetapaTipoVehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subetapa_id' })
  subetapaId: number;

  @ManyToOne(() => Subetapa)
  @JoinColumn({ name: 'subetapa_id' })
  subetapa: Subetapa;

  @Column({ name: 'tipo_vehiculo_id' })
  tipoVehiculoId: number;

  @ManyToOne(() => TipoVehiculo)
  @JoinColumn({ name: 'tipo_vehiculo_id' })
  tipoVehiculo: TipoVehiculo;

  @Column()
  orden: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
