import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity('mensaje')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_id', nullable: true })
  chatId: number;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ name: 'usuario_autor_id', nullable: true })
  usuarioAutorId: number;

  @Column({ type: 'text', nullable: true })
  contenido: string;

  @Column({ name: 'fecha_hora', type: 'timestamp', nullable: true })
  fechaHora: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
