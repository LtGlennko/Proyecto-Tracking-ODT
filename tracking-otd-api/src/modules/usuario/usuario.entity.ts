import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable,
} from 'typeorm';
import { Empresa } from '../empresa/empresa.entity';

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

  @ManyToMany(() => Empresa, (empresa) => empresa.usuarios, { eager: false })
  @JoinTable({
    name: 'usuario_empresa',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'empresa_id', referencedColumnName: 'id' },
  })
  empresas: Empresa[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
