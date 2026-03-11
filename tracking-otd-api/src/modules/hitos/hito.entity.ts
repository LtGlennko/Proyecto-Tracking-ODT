import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { GrupoParalelo } from './grupo-paralelo.entity';
import { Subetapa } from './subetapa.entity';

@Entity('hito')
export class Hito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_paralelo_id', nullable: true })
  grupoParaleloId: number;

  @ManyToOne(() => GrupoParalelo, g => g.hitos)
  @JoinColumn({ name: 'grupo_paralelo_id' })
  grupoParalelo: GrupoParalelo;

  @Column({ name: 'usuario_responsable_id', nullable: true })
  usuarioResponsableId: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  carril: string;

  @Column({ nullable: true })
  orden: number;

  @Column({ name: 'tipo_vehiculo', nullable: true })
  tipoVehiculo: string;

  @Column({ nullable: true })
  activo: boolean;

  @OneToMany(() => Subetapa, s => s.hito)
  subetapas: Subetapa[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
