import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vin } from '../vin/vin.entity';
import { Subetapa } from '../hitos/subetapa.entity';

@Entity('vin_subetapa_tracking')
export class VinSubetapaTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vin_id', nullable: true })
  vinId: string;

  @ManyToOne(() => Vin)
  @JoinColumn({ name: 'vin_id' })
  vin: Vin;

  @Column({ name: 'subetapa_id', nullable: true })
  subetapaId: number;

  @ManyToOne(() => Subetapa)
  @JoinColumn({ name: 'subetapa_id' })
  subetapa: Subetapa;

  @Column({ name: 'fecha_plan', type: 'date', nullable: true })
  fechaPlan: Date;

  @Column({ name: 'fecha_real', type: 'date', nullable: true })
  fechaReal: Date;  // Needed for GAP manuales (subetapas without campo_staging_vin)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
