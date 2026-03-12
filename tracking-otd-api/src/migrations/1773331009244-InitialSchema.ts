import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773331009244 implements MigrationInterface {
    name = 'InitialSchema1773331009244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "empresa" ("id" SERIAL NOT NULL, "nombre" character varying, "codigo" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4c869c777d5e8181ea001eef26b" UNIQUE ("codigo"), CONSTRAINT "PK_bee78e8f1760ccf9cff402118a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cliente" ("id" SERIAL NOT NULL, "empresa_id" integer, "nombre" character varying, "ruc" character varying, "is_vic" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ficha" ("id" SERIAL NOT NULL, "cliente_id" integer, "codigo" character varying, "forma_pago" character varying, "fecha_creacion" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00e85ebf7b3b91cebebcef6906c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vin" ("id" character varying NOT NULL, "ficha_id" integer, "marca" character varying, "modelo" character varying, "segmento" character varying, "linea_negocio" character varying, "tipo_vehiculo" character varying, "lote" character varying, "ejecutivo_sap" character varying, "tipo_financiamiento" character varying, "eta_entrega_final" date, "desviacion_acumulada" integer, "ultima_actualizacion" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9a01638ca3294db34207fbf42b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "staging_vin" ("vin" character varying NOT NULL, "lote_asignado" character varying, "id_ficha_sap" character varying, "pedido_interno" character varying, "pedido_externo" character varying, "pedido_venta_sap" character varying, "linea_negocio" character varying, "clase" character varying, "modelo_comercial" character varying, "modelo_facturacion" character varying, "sku" character varying, "matricula" character varying, "cod_cliente_sap" character varying, "nombre_cliente_sap" character varying, "cliente_comex" character varying, "cod_vendedor" character varying, "nombre_vendedor" character varying, "estado_comex" character varying, "estado_ficha_sap" character varying, "status_compra_sap" character varying, "fecha_colocacion" date, "mes_prod_confirmado" character varying, "fecha_liberacion_fabrica" date, "carrocero" character varying, "fecha_recojo_carr_zcar" date, "fecha_ingreso_prod_carr_planif" date, "fecha_ingreso_prod_carr_real" date, "fecha_lib_prod_carr_planif" date, "fecha_fin_prod_carr_real" date, "dias_prod_carr_planif" integer, "dias_prod_carr_real" integer, "modalidad_embarque" character varying, "transportista" character varying, "remonta" character varying, "etd" date, "fecha_embarque_sap" date, "fecha_llegada_aduana" date, "fecha_llegada_sap" date, "eta" date, "fecha_aduana_sap" date, "fecha_nacion" date, "num_declaracion" character varying, "fecha_ingreso_patio" date, "fecha_liberado_sap" date, "fecha_preasignacion" date, "fecha_asignacion" date, "num_factura_sap" character varying, "num_factura_comex" character varying, "fecha_facturacion_sap" date, "fecha_factura_comex" date, "precio_confirmado" numeric(15,2), "precio_venta_pv" numeric(15,2), "precio_lista" numeric(15,2), "fcc" date, "fcr" date, "fcl" date, "fclr" date, "fecha_entrega_planificada" date, "fecha_entrega_real" date, "fecha_entrega_cliente" date, "fuente_ultima_sync" character varying, "fecha_sync_sap" TIMESTAMP, "fecha_sync_comex" TIMESTAMP, "observaciones_comex" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_076774472de65fa261f4bf7b88e" PRIMARY KEY ("vin"))`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "azure_ad_oid" character varying, "nombre" character varying, "email" character varying, "perfil" character varying, "activo" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0d1f1dc9113276f1fb5ed1817ba" UNIQUE ("azure_ad_oid"), CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grupo_paralelo" ("id" SERIAL NOT NULL, "nombre" character varying, "orden_global" integer, "descripcion" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef6b698017c45a4af70969eacb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hito" ("id" SERIAL NOT NULL, "grupo_paralelo_id" integer, "usuario_responsable_id" integer, "nombre" character varying, "carril" character varying, "orden" integer, "tipo_vehiculo" character varying, "activo" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ff760cc6cf983d3e4d8e1b3769f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subetapa" ("id" SERIAL NOT NULL, "hito_id" integer, "nombre" character varying, "categoria" character varying, "orden" integer, "activo_default" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_445efc9997ef5ce6f0e5fd59872" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sla_config" ("id" SERIAL NOT NULL, "empresa_id" integer, "subetapa_id" integer, "linea_negocio" character varying, "tipo_vehiculo" character varying, "dias_objetivo" integer, "dias_tolerancia" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea5920d44ccb8132bfd317c81c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vin_subetapa_tracking" ("id" SERIAL NOT NULL, "vin_id" character varying, "subetapa_id" integer, "fecha_plan" date, "fecha_real" date, "estado" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_481c6cee4751ce31138f9d79693" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vin_hito_tracking" ("id" SERIAL NOT NULL, "vin_id" character varying, "hito_id" integer, "fecha_plan" date, "fecha_real" date, "estado" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a640aa6041a37d7e7f824e5e03f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subetapa_config" ("id" SERIAL NOT NULL, "subetapa_id" integer, "marca" character varying, "segmento" character varying, "tipo_vehiculo" character varying, "activo" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2979b3cd1cd6772a0c4df68795d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" SERIAL NOT NULL, "tipo" character varying, "ficha_id" integer, "vin_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mensaje" ("id" SERIAL NOT NULL, "chat_id" integer, "usuario_autor_id" integer, "contenido" text, "fecha_hora" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_335fa8b9b8e643289485ea98138" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notificacion" ("id" SERIAL NOT NULL, "usuario_destino_id" integer, "mensaje_id" integer, "canal" character varying, "url_redireccion" character varying, "fecha_envio" TIMESTAMP, "estado_envio" character varying, CONSTRAINT "PK_b4402a54386266ca21a86420f77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mensaje_etiqueta" ("id" SERIAL NOT NULL, "mensaje_id" integer, "usuario_etiquetado_id" integer, CONSTRAINT "PK_90beaf981ee07f732f301e56ea8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alerta" ("id" SERIAL NOT NULL, "vin_id" character varying, "hito_id" integer, "usuario_responsable_id" integer, "nivel" character varying, "dias_demora" integer, "estado_alerta" character varying, "fecha_generacion" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e60bfc27e2ae1b6bbdca11ac524" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alerta_accion" ("id" SERIAL NOT NULL, "alerta_id" integer, "usuario_accion_id" integer, "accion_tomada" character varying, "fecha_accion" TIMESTAMP, "notas" text, CONSTRAINT "PK_1120ed2be201c9999f74c152ac3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD CONSTRAINT "FK_fe42c0096479ed3ebb2ec952ec2" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ficha" ADD CONSTRAINT "FK_8c66ce354881dd05ac1081075c2" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vin" ADD CONSTRAINT "FK_019f75407d904b2bcb1624d078b" FOREIGN KEY ("ficha_id") REFERENCES "ficha"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hito" ADD CONSTRAINT "FK_43bbe248d07946e31a25a345ee6" FOREIGN KEY ("grupo_paralelo_id") REFERENCES "grupo_paralelo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subetapa" ADD CONSTRAINT "FK_b62e558f4bc071363bd91d278d5" FOREIGN KEY ("hito_id") REFERENCES "hito"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sla_config" ADD CONSTRAINT "FK_b78da21c4d3926281989cae3911" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sla_config" ADD CONSTRAINT "FK_27ab00751ce1cd644bb004b4f86" FOREIGN KEY ("subetapa_id") REFERENCES "subetapa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vin_subetapa_tracking" ADD CONSTRAINT "FK_43405366f17db28f1205c37b905" FOREIGN KEY ("vin_id") REFERENCES "vin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vin_subetapa_tracking" ADD CONSTRAINT "FK_0ef9fb996cfc77bbf9dabc3801f" FOREIGN KEY ("subetapa_id") REFERENCES "subetapa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vin_hito_tracking" ADD CONSTRAINT "FK_218c8e224caff8a41a79dc1de3c" FOREIGN KEY ("vin_id") REFERENCES "vin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vin_hito_tracking" ADD CONSTRAINT "FK_fe97a5b145ac7fced31adc3ebc0" FOREIGN KEY ("hito_id") REFERENCES "hito"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subetapa_config" ADD CONSTRAINT "FK_54870eeed0ecf1a0dc3df6734d3" FOREIGN KEY ("subetapa_id") REFERENCES "subetapa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_6dd542573363a6d2dff40806536" FOREIGN KEY ("ficha_id") REFERENCES "ficha"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_cc85962b253a67e9506fea7daa6" FOREIGN KEY ("vin_id") REFERENCES "vin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mensaje" ADD CONSTRAINT "FK_e5ae16e19a899181e1bb81c532a" FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificacion" ADD CONSTRAINT "FK_6e2ce9f174096750bb87c809d4b" FOREIGN KEY ("mensaje_id") REFERENCES "mensaje"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mensaje_etiqueta" ADD CONSTRAINT "FK_df68f56b9ef9be162ece016a001" FOREIGN KEY ("mensaje_id") REFERENCES "mensaje"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerta" ADD CONSTRAINT "FK_8394b0761a5ec2590b254cb847a" FOREIGN KEY ("vin_id") REFERENCES "vin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerta" ADD CONSTRAINT "FK_246963269c64c1ec0e4b025c35d" FOREIGN KEY ("hito_id") REFERENCES "hito"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerta_accion" ADD CONSTRAINT "FK_3faa00af2164bc12b36a843157d" FOREIGN KEY ("alerta_id") REFERENCES "alerta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alerta_accion" DROP CONSTRAINT "FK_3faa00af2164bc12b36a843157d"`);
        await queryRunner.query(`ALTER TABLE "alerta" DROP CONSTRAINT "FK_246963269c64c1ec0e4b025c35d"`);
        await queryRunner.query(`ALTER TABLE "alerta" DROP CONSTRAINT "FK_8394b0761a5ec2590b254cb847a"`);
        await queryRunner.query(`ALTER TABLE "mensaje_etiqueta" DROP CONSTRAINT "FK_df68f56b9ef9be162ece016a001"`);
        await queryRunner.query(`ALTER TABLE "notificacion" DROP CONSTRAINT "FK_6e2ce9f174096750bb87c809d4b"`);
        await queryRunner.query(`ALTER TABLE "mensaje" DROP CONSTRAINT "FK_e5ae16e19a899181e1bb81c532a"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_cc85962b253a67e9506fea7daa6"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_6dd542573363a6d2dff40806536"`);
        await queryRunner.query(`ALTER TABLE "subetapa_config" DROP CONSTRAINT "FK_54870eeed0ecf1a0dc3df6734d3"`);
        await queryRunner.query(`ALTER TABLE "vin_hito_tracking" DROP CONSTRAINT "FK_fe97a5b145ac7fced31adc3ebc0"`);
        await queryRunner.query(`ALTER TABLE "vin_hito_tracking" DROP CONSTRAINT "FK_218c8e224caff8a41a79dc1de3c"`);
        await queryRunner.query(`ALTER TABLE "vin_subetapa_tracking" DROP CONSTRAINT "FK_0ef9fb996cfc77bbf9dabc3801f"`);
        await queryRunner.query(`ALTER TABLE "vin_subetapa_tracking" DROP CONSTRAINT "FK_43405366f17db28f1205c37b905"`);
        await queryRunner.query(`ALTER TABLE "sla_config" DROP CONSTRAINT "FK_27ab00751ce1cd644bb004b4f86"`);
        await queryRunner.query(`ALTER TABLE "sla_config" DROP CONSTRAINT "FK_b78da21c4d3926281989cae3911"`);
        await queryRunner.query(`ALTER TABLE "subetapa" DROP CONSTRAINT "FK_b62e558f4bc071363bd91d278d5"`);
        await queryRunner.query(`ALTER TABLE "hito" DROP CONSTRAINT "FK_43bbe248d07946e31a25a345ee6"`);
        await queryRunner.query(`ALTER TABLE "vin" DROP CONSTRAINT "FK_019f75407d904b2bcb1624d078b"`);
        await queryRunner.query(`ALTER TABLE "ficha" DROP CONSTRAINT "FK_8c66ce354881dd05ac1081075c2"`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP CONSTRAINT "FK_fe42c0096479ed3ebb2ec952ec2"`);
        await queryRunner.query(`DROP TABLE "alerta_accion"`);
        await queryRunner.query(`DROP TABLE "alerta"`);
        await queryRunner.query(`DROP TABLE "mensaje_etiqueta"`);
        await queryRunner.query(`DROP TABLE "notificacion"`);
        await queryRunner.query(`DROP TABLE "mensaje"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "subetapa_config"`);
        await queryRunner.query(`DROP TABLE "vin_hito_tracking"`);
        await queryRunner.query(`DROP TABLE "vin_subetapa_tracking"`);
        await queryRunner.query(`DROP TABLE "sla_config"`);
        await queryRunner.query(`DROP TABLE "subetapa"`);
        await queryRunner.query(`DROP TABLE "hito"`);
        await queryRunner.query(`DROP TABLE "grupo_paralelo"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TABLE "staging_vin"`);
        await queryRunner.query(`DROP TABLE "vin"`);
        await queryRunner.query(`DROP TABLE "ficha"`);
        await queryRunner.query(`DROP TABLE "cliente"`);
        await queryRunner.query(`DROP TABLE "empresa"`);
    }

}
