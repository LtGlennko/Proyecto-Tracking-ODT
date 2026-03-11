import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ficha } from '../ficha/ficha.entity';

@Entity('vin')
export class Vin {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'ficha_id', nullable: true })
  fichaId: number;

  @ManyToOne(() => Ficha)
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  modelo: string;

  @Column({ nullable: true })
  segmento: string;

  @Column({ name: 'linea_negocio', nullable: true })
  lineaNegocio: string;

  @Column({ name: 'tipo_vehiculo', nullable: true })
  tipoVehiculo: string;

  @Column({ nullable: true })
  lote: string;

  @Column({ name: 'ejecutivo_sap', nullable: true })
  ejecutivoSap: string;

  @Column({ name: 'tipo_financiamiento', nullable: true })
  tipoFinanciamiento: string;

  @Column({ name: 'eta_entrega_final', type: 'date', nullable: true })
  etaEntregaFinal: Date;

  @Column({ name: 'desviacion_acumulada', nullable: true })
  desviacionAcumulada: number;

  @Column({ name: 'ultima_actualizacion', type: 'timestamp', nullable: true })
  ultimaActualizacion: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
