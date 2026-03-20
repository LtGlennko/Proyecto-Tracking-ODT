import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tipo: string;

  @Column({ name: 'ficha_codigo', nullable: true })
  fichaCodigo: string;

  @Column({ name: 'vin_id', nullable: true })
  vinId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
