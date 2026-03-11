import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vin } from '../vin/vin.entity';
import { Hito } from '../hitos/hito.entity';

@Entity('vin_hito_tracking')
export class VinHitoTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vin_id', nullable: true })
  vinId: string;

  @ManyToOne(() => Vin)
  @JoinColumn({ name: 'vin_id' })
  vin: Vin;

  @Column({ name: 'hito_id', nullable: true })
  hitoId: number;

  @ManyToOne(() => Hito)
  @JoinColumn({ name: 'hito_id' })
  hito: Hito;

  @Column({ name: 'fecha_plan', type: 'date', nullable: true })
  fechaPlan: Date;

  @Column({ name: 'fecha_real', type: 'date', nullable: true })
  fechaReal: Date;

  // diferencia_dias: NEVER persisted, calculated at service level
  @Column({ nullable: true })
  estado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
