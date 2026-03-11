import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Alerta } from './alerta.entity';

@Entity('alerta_accion')
export class AlertaAccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'alerta_id', nullable: true })
  alertaId: number;

  @ManyToOne(() => Alerta)
  @JoinColumn({ name: 'alerta_id' })
  alerta: Alerta;

  @Column({ name: 'usuario_accion_id', nullable: true })
  usuarioAccionId: number;

  @Column({ name: 'accion_tomada', nullable: true })
  accionTomada: string;

  @Column({ name: 'fecha_accion', type: 'timestamp', nullable: true })
  fechaAccion: Date;

  @Column({ type: 'text', nullable: true })
  notas: string;
}
