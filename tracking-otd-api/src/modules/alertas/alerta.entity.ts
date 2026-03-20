import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Hito } from '../hitos/hito.entity';

@Entity('alerta')
export class Alerta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vin_id', nullable: true })
  vinId: string;

  @Column({ name: 'hito_id', nullable: true })
  hitoId: number;

  @ManyToOne(() => Hito)
  @JoinColumn({ name: 'hito_id' })
  hito: Hito;

  @Column({ name: 'usuario_responsable_id', nullable: true })
  usuarioResponsableId: number;

  @Column({ nullable: true })
  nivel: string;

  @Column({ name: 'dias_demora', nullable: true })
  diasDemora: number;

  @Column({ name: 'estado_alerta', nullable: true })
  estadoAlerta: string;

  @Column({ name: 'fecha_generacion', type: 'timestamp', nullable: true })
  fechaGeneracion: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
