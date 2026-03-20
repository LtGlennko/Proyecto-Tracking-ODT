import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('staging_vin')
export class StagingVin {
  @PrimaryColumn()
  vin: string;

  @Column({ name: 'archivo_fuente', type: 'varchar', length: 255, nullable: true }) archivoFuente: string;

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

  @Column({ name: 'cond_pago', type: 'varchar', length: 10, nullable: true }) condPago: string;
  @Column({ name: 'descripcion_cond_pago', type: 'varchar', length: 100, nullable: true }) descripcionCondPago: string;

  // ── Inmatriculación ──
  @Column({ name: 'situacion_inmatric', type: 'varchar', length: 100, nullable: true }) situacionInmatric: string;
  @Column({ name: 'fecha_inicio_inmatric', type: 'date', nullable: true }) fechaInicioInmatric: Date;
  @Column({ name: 'fecha_titulo', type: 'date', nullable: true }) fechaTitulo: Date;
  @Column({ name: 'numero_titulo', type: 'varchar', length: 50, nullable: true }) numeroTitulo: string;
  @Column({ name: 'placa', type: 'varchar', length: 20, nullable: true }) placa: string;
  @Column({ name: 'fecha_inscrito', type: 'date', nullable: true }) fechaInscrito: Date;
  @Column({ name: 'fecha_rep_placa', type: 'date', nullable: true }) fechaRepPlaca: Date;
  @Column({ name: 'fecha_rec_doc_car', type: 'date', nullable: true }) fechaRecDocCar: Date;
  @Column({ name: 'fecha_rec_doc', type: 'date', nullable: true }) fechaRecDoc: Date;
  @Column({ name: 'fecha_em_doc', type: 'date', nullable: true }) fechaEmDoc: Date;
  @Column({ name: 'fecha_obs_app', type: 'date', nullable: true }) fechaObsApp: Date;
  @Column({ name: 'fecha_cal_sunarp', type: 'date', nullable: true }) fechaCalSunarp: Date;
  @Column({ name: 'oficina_registral', type: 'varchar', length: 100, nullable: true }) oficinaRegistral: string;
  @Column({ name: 'fecha_maxima_tramite', type: 'date', nullable: true }) fechaMaximaTramite: Date;
  @Column({ name: 'fecha_cancelacion', type: 'date', nullable: true }) fechaCancelacion: Date;
  @Column({ name: 'folio', type: 'varchar', length: 50, nullable: true }) folio: string;

  // ── Datos complementarios (Inmatriculación) ──
  @Column({ name: 'clase_operacion', type: 'varchar', length: 50, nullable: true }) claseOperacion: string;
  @Column({ name: 'color', type: 'varchar', length: 100, nullable: true }) color: string;
  @Column({ name: 'cod_color', type: 'varchar', length: 20, nullable: true }) codColor: string;
  @Column({ name: 'tapiz', type: 'varchar', length: 100, nullable: true }) tapiz: string;
  @Column({ name: 'cod_tapiz', type: 'varchar', length: 20, nullable: true }) codTapiz: string;
  @Column({ name: 'd_canal', type: 'varchar', length: 50, nullable: true }) dCanal: string;

  // Campos adicionales según Fuente Hitos
  @Column({ name: 'fecha_confirmacion_fabrica', type: 'date', nullable: true }) fechaConfirmacionFabrica: Date;
  @Column({ name: 'fecha_salida_fabrica', type: 'date', nullable: true }) fechaSalidaFabrica: Date;
  @Column({ name: 'fecha_salida_carrocero', type: 'date', nullable: true }) fechaSalidaCarrocero: Date;
  @Column({ name: 'fecha_soli_credito', type: 'date', nullable: true }) fechaSoliCredito: Date;
  @Column({ name: 'fecha_aprobacion_credito', type: 'date', nullable: true }) fechaAprobacionCredito: Date;
  @Column({ name: 'fecha_entrega_exp', type: 'date', nullable: true }) fechaEntregaExp: Date;
  @Column({ name: 'fecha_obs_sunarp', type: 'date', nullable: true }) fechaObsSunarp: Date;
  @Column({ name: 'fecha_reingresado', type: 'date', nullable: true }) fechaReingresado: Date;
  @Column({ name: 'zpca', type: 'date', nullable: true }) zpca: Date;
  @Column({ name: 'per_contingente', type: 'date', nullable: true }) perContingente: Date;
  @Column({ name: 'fecha_recojo_transportista', type: 'date', nullable: true }) fechaRecojoTransportista: Date;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
