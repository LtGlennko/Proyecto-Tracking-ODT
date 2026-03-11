import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Hito } from './hito.entity';

@Entity('grupo_paralelo')
export class GrupoParalelo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ name: 'orden_global', nullable: true })
  ordenGlobal: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => Hito, h => h.grupoParalelo)
  hitos: Hito[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
