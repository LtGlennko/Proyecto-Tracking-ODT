import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mensaje } from './mensaje.entity';

@Entity('mensaje_etiqueta')
export class MensajeEtiqueta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mensaje_id', nullable: true })
  mensajeId: number;

  @ManyToOne(() => Mensaje)
  @JoinColumn({ name: 'mensaje_id' })
  mensaje: Mensaje;

  @Column({ name: 'usuario_etiquetado_id', nullable: true })
  usuarioEtiquetadoId: number;
}
