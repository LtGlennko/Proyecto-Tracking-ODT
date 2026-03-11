import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('staging_vin')
export class StagingVin {
  @PrimaryColumn()
  vin: string;

  @Column({ name: 'lote_asignado', nullable: true }) loteAsignado: string;
  @Column({ name: 'id_ficha_sap', nullable: true }) idFichaSap: string;
  @Column({ name: 'pedido_interno', nullable: true }) pedidoInterno: string;
  @Column({ name: 'pedido_externo', nullable: true }) pedidoExterno: string;
  @Column({ name: 'pedido_venta_sap', nullable: true }) pedidoVentaSap: string;
  @Column({ name: 'linea_negocio', nullable: true }) lineaNegocio: string;
  @Column({ nullable: true }) clase: string;
  @Column({ name: 'modelo_comercial', nullable: true }) modeloComercial: string;
  @Column({ name: 'modelo_facturacion', nullable: true }) modeloFacturacion: string;
  @Column({ nullable: true }) sku: string;
  @Column({ nullable: true }) matricula: string;
  @Column({ name: 'cod_cliente_sap', nullable: true }) codClienteSap: string;
  @Column({ name: 'nombre_cliente_sap', nullable: true }) nombreClienteSap: string;
  @Column({ name: 'cliente_comex', nullable: true }) clienteComex: string;
  @Column({ name: 'cod_vendedor', nullable: true }) codVendedor: string;
  @Column({ name: 'nombre_vendedor', nullable: true }) nombreVendedor: string;
  @Column({ name: 'estado_comex', nullable: true }) estadoComex: string;
  @Column({ name: 'estado_ficha_sap', nullable: true }) estadoFichaSap: string;
  @Column({ name: 'status_compra_sap', nullable: true }) statusCompraSap: string;
  @Column({ name: 'fecha_colocacion', type: 'date', nullable: true }) fechaColocacion: Date;
  @Column({ name: 'mes_prod_confirmado', nullable: true }) mesProdConfirmado: string;
  @Column({ name: 'fecha_liberacion_fabrica', type: 'date', nullable: true }) fechaLiberacionFabrica: Date;
  @Column({ nullable: true }) carrocero: string;
  @Column({ name: 'fecha_recojo_carr_zcar', type: 'date', nullable: true }) fechaRecojoCarrZcar: Date;
  @Column({ name: 'fecha_ingreso_prod_carr_planif', type: 'date', nullable: true }) fechaIngresoProdCarrPlanif: Date;
  @Column({ name: 'fecha_ingreso_prod_carr_real', type: 'date', nullable: true }) fechaIngresoProdCarrReal: Date;
  @Column({ name: 'fecha_lib_prod_carr_planif', type: 'date', nullable: true }) fechaLibProdCarrPlanif: Date;
  @Column({ name: 'fecha_fin_prod_carr_real', type: 'date', nullable: true }) fechaFinProdCarrReal: Date;
  @Column({ name: 'dias_prod_carr_planif', nullable: true }) diasProdCarrPlanif: number;
  @Column({ name: 'dias_prod_carr_real', nullable: true }) diasProdCarrReal: number;
  @Column({ name: 'modalidad_embarque', nullable: true }) modalidadEmbarque: string;
  @Column({ nullable: true }) transportista: string;
  @Column({ nullable: true }) remonta: string;
  @Column({ type: 'date', nullable: true }) etd: Date;
  @Column({ name: 'fecha_embarque_sap', type: 'date', nullable: true }) fechaEmbarqueSap: Date;
  @Column({ name: 'fecha_llegada_aduana', type: 'date', nullable: true }) fechaLlegadaAduana: Date;
  @Column({ name: 'fecha_llegada_sap', type: 'date', nullable: true }) fechaLlegadaSap: Date;
  @Column({ type: 'date', nullable: true }) eta: Date;
  @Column({ name: 'fecha_aduana_sap', type: 'date', nullable: true }) fechaAduanaSap: Date;
  @Column({ name: 'fecha_nacion', type: 'date', nullable: true }) fechaNacion: Date;
  @Column({ name: 'num_declaracion', nullable: true }) numDeclaracion: string;
  @Column({ name: 'fecha_ingreso_patio', type: 'date', nullable: true }) fechaIngresoPatio: Date;
  @Column({ name: 'fecha_liberado_sap', type: 'date', nullable: true }) fechaLiberadoSap: Date;
  @Column({ name: 'fecha_preasignacion', type: 'date', nullable: true }) fechaPreasignacion: Date;
  @Column({ name: 'fecha_asignacion', type: 'date', nullable: true }) fechaAsignacion: Date;
  @Column({ name: 'num_factura_sap', nullable: true }) numFacturaSap: string;
  @Column({ name: 'num_factura_comex', nullable: true }) numFacturaComex: string;
  @Column({ name: 'fecha_facturacion_sap', type: 'date', nullable: true }) fechaFacturacionSap: Date;
  @Column({ name: 'fecha_factura_comex', type: 'date', nullable: true }) fechaFacturaComex: Date;
  @Column({ name: 'precio_confirmado', type: 'decimal', precision: 15, scale: 2, nullable: true }) precioConfirmado: number;
  @Column({ name: 'precio_venta_pv', type: 'decimal', precision: 15, scale: 2, nullable: true }) precioVentaPv: number;
  @Column({ name: 'precio_lista', type: 'decimal', precision: 15, scale: 2, nullable: true }) precioLista: number;
  @Column({ type: 'date', nullable: true }) fcc: Date;
  @Column({ type: 'date', nullable: true }) fcr: Date;
  @Column({ type: 'date', nullable: true }) fcl: Date;
  @Column({ type: 'date', nullable: true }) fclr: Date;
  @Column({ name: 'fecha_entrega_planificada', type: 'date', nullable: true }) fechaEntregaPlanificada: Date;
  @Column({ name: 'fecha_entrega_real', type: 'date', nullable: true }) fechaEntregaReal: Date;
  @Column({ name: 'fecha_entrega_cliente', type: 'date', nullable: true }) fechaEntregaCliente: Date;
  @Column({ name: 'fuente_ultima_sync', nullable: true }) fuenteUltimaSync: string;
  @Column({ name: 'fecha_sync_sap', type: 'timestamp', nullable: true }) fechaSyncSap: Date;
  @Column({ name: 'fecha_sync_comex', type: 'timestamp', nullable: true }) fechaSyncComex: Date;
  @Column({ name: 'observaciones_comex', type: 'text', nullable: true }) observacionesComex: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
