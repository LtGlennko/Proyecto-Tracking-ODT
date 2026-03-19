import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subetapa } from './subetapa.entity';

@Entity('hito')
export class Hito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  carril: string;

  @Column({ nullable: true, length: 50 })
  icono: string;

  @Column({ default: 0 })
  orden: number;

  @OneToMany(() => Subetapa, s => s.hito)
  subetapas: Subetapa[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
