import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Empresa } from '../empresa/empresa.entity';
import { Subetapa } from '../hitos/subetapa.entity';
import { TipoVehiculo } from '../tipo-vehiculo/tipo-vehiculo.entity';

@Entity('sla_config')
export class SlaConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id', nullable: true })
  empresaId: number;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'subetapa_id', nullable: true })
  subetapaId: number;

  @ManyToOne(() => Subetapa)
  @JoinColumn({ name: 'subetapa_id' })
  subetapa: Subetapa;

  @Column({ name: 'tipo_vehiculo_id', nullable: true })
  tipoVehiculoId: number;

  @ManyToOne(() => TipoVehiculo)
  @JoinColumn({ name: 'tipo_vehiculo_id' })
  tipoVehiculo: TipoVehiculo;

  @Column({ name: 'dias_objetivo', nullable: true })
  diasObjetivo: number;

  @Column({ name: 'dias_tolerancia', nullable: true })
  diasTolerancia: number;

  // dias_critico: NEVER persisted — calculated as diasObjetivo + diasTolerancia
  get diasCritico(): number {
    return (this.diasObjetivo || 0) + (this.diasTolerancia || 0);
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
