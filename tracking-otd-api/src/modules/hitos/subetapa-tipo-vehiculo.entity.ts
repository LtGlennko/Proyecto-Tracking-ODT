import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Subetapa } from './subetapa.entity';

@Entity('subetapa_tipo_vehiculo')
@Unique(['subetapaId', 'tipoVehiculo'])
export class SubetapaTipoVehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subetapa_id' })
  subetapaId: number;

  @ManyToOne(() => Subetapa)
  @JoinColumn({ name: 'subetapa_id' })
  subetapa: Subetapa;

  @Column({ name: 'tipo_vehiculo' })
  tipoVehiculo: string;

  @Column()
  orden: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
