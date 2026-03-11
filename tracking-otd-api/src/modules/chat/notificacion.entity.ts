import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mensaje } from './mensaje.entity';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_destino_id', nullable: true })
  usuarioDestinoId: number;

  @Column({ name: 'mensaje_id', nullable: true })
  mensajeId: number;

  @ManyToOne(() => Mensaje)
  @JoinColumn({ name: 'mensaje_id' })
  mensaje: Mensaje;

  @Column({ nullable: true })
  canal: string;

  @Column({ name: 'url_redireccion', nullable: true })
  urlRedireccion: string;

  @Column({ name: 'fecha_envio', type: 'timestamp', nullable: true })
  fechaEnvio: Date;

  @Column({ name: 'estado_envio', nullable: true })
  estadoEnvio: string;
}
