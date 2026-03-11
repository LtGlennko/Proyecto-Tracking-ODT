import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subetapa } from './subetapa.entity';

@Entity('subetapa_config')
export class SubetapaConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subetapa_id', nullable: true })
  subetapaId: number;

  @ManyToOne(() => Subetapa)
  @JoinColumn({ name: 'subetapa_id' })
  subetapa: Subetapa;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  segmento: string;

  @Column({ name: 'tipo_vehiculo', nullable: true })
  tipoVehiculo: string;

  @Column({ nullable: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
