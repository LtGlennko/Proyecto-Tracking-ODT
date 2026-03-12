import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Hito } from './hito.entity';

@Entity('subetapa')
export class Subetapa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'hito_id', nullable: true })
  hitoId: number;

  @ManyToOne(() => Hito, h => h.subetapas)
  @JoinColumn({ name: 'hito_id' })
  hito: Hito;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  categoria: string;

  @Column({ name: 'campo_staging_vin', nullable: true })
  campoStagingVin: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
