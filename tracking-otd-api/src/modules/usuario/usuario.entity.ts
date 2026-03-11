import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'azure_ad_oid', nullable: true, unique: true })
  azureAdOid: string;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  perfil: string;

  @Column({ nullable: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
