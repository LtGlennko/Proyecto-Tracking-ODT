import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TipoVehiculo } from '../tipo-vehiculo/tipo-vehiculo.entity';

@Entity('vin')
export class Vin {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ name: 'tipo_vehiculo_id', nullable: true })
  tipoVehiculoId: number;

  @ManyToOne(() => TipoVehiculo)
  @JoinColumn({ name: 'tipo_vehiculo_id' })
  tipoVehiculo: TipoVehiculo;

  @Column({ name: 'ultima_actualizacion', type: 'timestamp', nullable: true })
  ultimaActualizacion: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
