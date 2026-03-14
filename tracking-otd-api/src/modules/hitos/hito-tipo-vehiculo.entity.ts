import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Hito } from './hito.entity';
import { GrupoParalelo } from './grupo-paralelo.entity';
import { TipoVehiculo } from '../tipo-vehiculo/tipo-vehiculo.entity';

@Entity('hito_tipo_vehiculo')
@Unique(['hitoId', 'tipoVehiculoId'])
export class HitoTipoVehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'hito_id' })
  hitoId: number;

  @ManyToOne(() => Hito)
  @JoinColumn({ name: 'hito_id' })
  hito: Hito;

  @Column({ name: 'tipo_vehiculo_id' })
  tipoVehiculoId: number;

  @ManyToOne(() => TipoVehiculo)
  @JoinColumn({ name: 'tipo_vehiculo_id' })
  tipoVehiculo: TipoVehiculo;

  @Column({ name: 'grupo_paralelo_id', nullable: true })
  grupoParaleloId: number;

  @ManyToOne(() => GrupoParalelo)
  @JoinColumn({ name: 'grupo_paralelo_id' })
  grupoParalelo: GrupoParalelo;

  @Column({ nullable: true })
  carril: string;

  @Column()
  orden: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
