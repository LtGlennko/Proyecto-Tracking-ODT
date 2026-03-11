import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Ficha } from '../ficha/ficha.entity';
import { Vin } from '../vin/vin.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tipo: string;

  @Column({ name: 'ficha_id', nullable: true })
  fichaId: number;

  @ManyToOne(() => Ficha)
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @Column({ name: 'vin_id', nullable: true })
  vinId: string;

  @ManyToOne(() => Vin)
  @JoinColumn({ name: 'vin_id' })
  vin: Vin;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
