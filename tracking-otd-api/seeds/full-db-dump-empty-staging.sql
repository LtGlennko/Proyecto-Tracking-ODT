--
-- PostgreSQL database dump
--

\restrict 5I6KhoPRtXFWyNbFo8ptkCMbJRobSqEGeXhBqz7BV1hoytIvEBbC9eY3tbetG3H

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alerta (
    id integer NOT NULL,
    vin_id character varying(50),
    hito_id integer,
    usuario_responsable_id integer,
    nivel character varying(50),
    dias_demora integer,
    estado_alerta character varying(50),
    fecha_generacion timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: alerta_accion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alerta_accion (
    id integer NOT NULL,
    alerta_id integer,
    usuario_accion_id integer,
    accion_tomada character varying(255),
    fecha_accion timestamp without time zone,
    notas text
);


--
-- Name: alerta_accion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alerta_accion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alerta_accion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alerta_accion_id_seq OWNED BY public.alerta_accion.id;


--
-- Name: alerta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alerta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alerta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alerta_id_seq OWNED BY public.alerta.id;


--
-- Name: chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat (
    id integer NOT NULL,
    tipo character varying(50),
    vin_id character varying(50),
    created_at timestamp without time zone,
    ficha_codigo character varying(100),
    CONSTRAINT chk_chat_xor CHECK (((ficha_codigo IS NULL) <> (vin_id IS NULL)))
);


--
-- Name: chat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_id_seq OWNED BY public.chat.id;


--
-- Name: empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresa (
    id integer NOT NULL,
    nombre character varying(255),
    codigo character varying(100),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: empresa_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empresa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: empresa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empresa_id_seq OWNED BY public.empresa.id;


--
-- Name: fuentes_vin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fuentes_vin (
    id integer NOT NULL,
    tipo_fuente character varying(50) NOT NULL,
    ruta_patron character varying(200) NOT NULL,
    columna_vin character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: fuentes_vin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fuentes_vin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fuentes_vin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fuentes_vin_id_seq OWNED BY public.fuentes_vin.id;


--
-- Name: grupo_paralelo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grupo_paralelo (
    id integer NOT NULL,
    nombre character varying(255),
    orden_global integer,
    descripcion text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: grupo_paralelo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grupo_paralelo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grupo_paralelo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grupo_paralelo_id_seq OWNED BY public.grupo_paralelo.id;


--
-- Name: hito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hito (
    id integer NOT NULL,
    nombre character varying(255),
    carril character varying(100),
    orden integer,
    activo boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    icono character varying(50)
);


--
-- Name: hito_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hito_id_seq OWNED BY public.hito.id;


--
-- Name: hito_tipo_vehiculo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hito_tipo_vehiculo (
    id integer NOT NULL,
    hito_id integer NOT NULL,
    grupo_paralelo_id integer,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    carril character varying,
    tipo_vehiculo_id integer NOT NULL
);


--
-- Name: hito_tipo_vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hito_tipo_vehiculo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hito_tipo_vehiculo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hito_tipo_vehiculo_id_seq OWNED BY public.hito_tipo_vehiculo.id;


--
-- Name: mapeo_campos_vin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mapeo_campos_vin (
    id integer NOT NULL,
    nombre_campo character varying(100) NOT NULL,
    id_fuente integer NOT NULL,
    nombre_columna_fuente character varying(150) NOT NULL,
    prioridad integer DEFAULT 1,
    activo boolean DEFAULT true
);


--
-- Name: mapeo_campos_vin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mapeo_campos_vin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mapeo_campos_vin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mapeo_campos_vin_id_seq OWNED BY public.mapeo_campos_vin.id;


--
-- Name: mensaje; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensaje (
    id integer NOT NULL,
    chat_id integer,
    usuario_autor_id integer,
    contenido text,
    fecha_hora timestamp without time zone,
    created_at timestamp without time zone
);


--
-- Name: mensaje_etiqueta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensaje_etiqueta (
    id integer NOT NULL,
    mensaje_id integer,
    usuario_etiquetado_id integer
);


--
-- Name: mensaje_etiqueta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mensaje_etiqueta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mensaje_etiqueta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mensaje_etiqueta_id_seq OWNED BY public.mensaje_etiqueta.id;


--
-- Name: mensaje_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mensaje_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mensaje_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mensaje_id_seq OWNED BY public.mensaje.id;


--
-- Name: notificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificacion (
    id integer NOT NULL,
    usuario_destino_id integer,
    mensaje_id integer,
    canal character varying(50),
    url_redireccion character varying(500),
    fecha_envio timestamp without time zone,
    estado_envio character varying(50)
);


--
-- Name: notificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificacion_id_seq OWNED BY public.notificacion.id;


--
-- Name: sla_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_config (
    id integer NOT NULL,
    empresa_id integer,
    subetapa_id integer,
    dias_objetivo integer,
    dias_tolerancia integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    tipo_vehiculo_id integer
);


--
-- Name: sla_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sla_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sla_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sla_config_id_seq OWNED BY public.sla_config.id;


--
-- Name: staging_vin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staging_vin (
    vin character varying(50) NOT NULL,
    lote_asignado character varying(100),
    id_ficha_sap character varying(100),
    pedido_interno character varying(100),
    pedido_externo character varying(100),
    pedido_venta_sap character varying(100),
    linea_negocio character varying(100),
    clase character varying(100),
    modelo_comercial character varying(255),
    modelo_facturacion character varying(255),
    sku character varying(100),
    matricula character varying(100),
    cod_cliente_sap character varying(100),
    nombre_cliente_sap character varying(255),
    cliente_comex character varying(255),
    cod_vendedor character varying(100),
    nombre_vendedor character varying(255),
    estado_comex character varying(100),
    estado_ficha_sap character varying(100),
    status_compra_sap character varying(100),
    fecha_colocacion date,
    mes_prod_confirmado character varying(50),
    fecha_liberacion_fabrica date,
    carrocero character varying(100),
    fecha_recojo_carr_zcar date,
    fecha_ingreso_prod_carr_planif date,
    fecha_ingreso_prod_carr_real date,
    fecha_lib_prod_carr_planif date,
    fecha_fin_prod_carr_real date,
    dias_prod_carr_planif integer,
    dias_prod_carr_real integer,
    modalidad_embarque character varying(100),
    transportista character varying(100),
    remonta character varying(100),
    etd date,
    fecha_embarque_sap date,
    fecha_llegada_aduana date,
    fecha_llegada_sap date,
    eta date,
    fecha_aduana_sap date,
    fecha_nacion date,
    num_declaracion character varying(100),
    fecha_ingreso_patio date,
    fecha_liberado_sap date,
    fecha_preasignacion date,
    fecha_asignacion date,
    num_factura_sap character varying(100),
    num_factura_comex character varying(100),
    fecha_facturacion_sap date,
    fecha_factura_comex date,
    precio_confirmado numeric(15,2),
    precio_venta_pv numeric(15,2),
    precio_lista numeric(15,2),
    fcc date,
    fcr date,
    fcl date,
    fclr date,
    fecha_entrega_planificada date,
    fecha_entrega_real date,
    fecha_entrega_cliente date,
    fuente_ultima_sync character varying(100),
    fecha_sync_sap timestamp without time zone,
    fecha_sync_comex timestamp without time zone,
    observaciones_comex text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    cond_pago character varying(10),
    descripcion_cond_pago character varying(100),
    situacion_inmatric character varying(100),
    fecha_inicio_inmatric date,
    fecha_titulo date,
    numero_titulo character varying(50),
    placa character varying(20),
    fecha_inscrito date,
    fecha_rep_placa date,
    fecha_rec_doc_car date,
    fecha_rec_doc date,
    fecha_em_doc date,
    fecha_obs_app date,
    fecha_cal_sunarp date,
    oficina_registral character varying(100),
    fecha_maxima_tramite date,
    fecha_cancelacion date,
    folio character varying(50),
    clase_operacion character varying(50),
    color character varying(100),
    cod_color character varying(20),
    tapiz character varying(100),
    cod_tapiz character varying(20),
    d_canal character varying(50),
    archivo_fuente character varying(255),
    fecha_confirmacion_fabrica date,
    fecha_salida_fabrica date,
    fecha_salida_carrocero date,
    fecha_soli_credito date,
    fecha_aprobacion_credito date,
    fecha_entrega_exp date,
    fecha_obs_sunarp date,
    fecha_reingresado date,
    zpca date,
    per_contingente date,
    fecha_recojo_transportista date
);


--
-- Name: subetapa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subetapa (
    id integer NOT NULL,
    hito_id integer,
    nombre character varying(255),
    orden integer,
    activo_default boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    campo_staging_real character varying,
    campo_staging_plan character varying
);


--
-- Name: subetapa_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subetapa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subetapa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subetapa_id_seq OWNED BY public.subetapa.id;


--
-- Name: subetapa_tipo_vehiculo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subetapa_tipo_vehiculo (
    id integer NOT NULL,
    subetapa_id integer NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    tipo_vehiculo_id integer NOT NULL
);


--
-- Name: subetapa_tipo_vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subetapa_tipo_vehiculo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subetapa_tipo_vehiculo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subetapa_tipo_vehiculo_id_seq OWNED BY public.subetapa_tipo_vehiculo.id;


--
-- Name: tipo_vehiculo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_vehiculo (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    color character varying(20),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    icono character varying(50)
);


--
-- Name: tipo_vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_vehiculo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipo_vehiculo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_vehiculo_id_seq OWNED BY public.tipo_vehiculo.id;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    azure_ad_oid character varying(255),
    nombre character varying(255),
    email character varying(255),
    perfil character varying(100),
    activo boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: usuario_empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario_empresa (
    id integer NOT NULL,
    usuario_id integer,
    empresa_id integer
);


--
-- Name: usuario_empresa_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_empresa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_empresa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_empresa_id_seq OWNED BY public.usuario_empresa.id;


--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: vista_tracking_vin; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vista_tracking_vin AS
 SELECT sv.vin,
    sv.updated_at AS ultima_actualizacion,
        CASE
            WHEN ((sv.linea_negocio)::text = 'VC'::text) THEN 1
            WHEN ((sv.linea_negocio)::text = 'Buses'::text) THEN 2
            WHEN ((sv.linea_negocio)::text = 'Maquinarias'::text) THEN 3
            WHEN ((sv.linea_negocio)::text = 'Autos'::text) THEN 4
            ELSE 2
        END AS tipo_vehiculo_id,
    tv.nombre AS tipo_vehiculo_nombre,
    tv.color AS tipo_vehiculo_color,
    tv.icono AS tipo_vehiculo_icono,
    sv.id_ficha_sap AS ficha_codigo,
    sv.fecha_colocacion AS ficha_fecha_creacion,
    sv.cod_cliente_sap AS cliente_id,
    sv.nombre_cliente_sap AS cliente_nombre,
    false AS cliente_is_vic,
    1 AS empresa_id,
    'Divemotor'::character varying AS empresa_nombre,
    'DIV'::character varying AS empresa_codigo,
    sv.modelo_comercial AS modelo,
    sv.lote_asignado AS lote,
    sv.pedido_interno AS orden_compra,
    sv.descripcion_cond_pago AS forma_pago,
    sv.nombre_vendedor AS ejecutivo,
    sv.id_ficha_sap,
    sv.pedido_externo,
    sv.pedido_venta_sap,
    sv.linea_negocio,
    sv.clase,
    sv.modelo_facturacion,
    sv.sku,
    sv.matricula,
    sv.cod_cliente_sap,
    sv.nombre_cliente_sap,
        CASE
            WHEN (upper(TRIM(BOTH FROM sv.cliente_comex)) = 'STOCK'::text) THEN NULL::character varying
            ELSE sv.cliente_comex
        END AS cliente_comex,
    sv.cod_vendedor,
    sv.estado_comex,
    sv.estado_ficha_sap,
    sv.status_compra_sap,
    sv.fecha_colocacion,
    sv.mes_prod_confirmado,
    sv.fecha_liberacion_fabrica,
    sv.carrocero,
    sv.fecha_recojo_carr_zcar,
    sv.fecha_ingreso_prod_carr_planif,
    sv.fecha_ingreso_prod_carr_real,
    sv.fecha_lib_prod_carr_planif,
    sv.fecha_fin_prod_carr_real,
    sv.dias_prod_carr_planif,
    sv.dias_prod_carr_real,
    sv.modalidad_embarque,
    sv.transportista,
    sv.remonta,
    sv.etd,
    sv.fecha_embarque_sap,
    sv.fecha_llegada_aduana,
    sv.fecha_llegada_sap,
    sv.eta,
    sv.fecha_aduana_sap,
    sv.fecha_nacion,
    sv.num_declaracion,
    sv.fecha_ingreso_patio,
    sv.fecha_liberado_sap,
    sv.fecha_preasignacion,
    sv.fecha_asignacion,
    sv.num_factura_sap,
    sv.num_factura_comex,
    sv.fecha_facturacion_sap,
    sv.fecha_factura_comex,
    sv.precio_confirmado,
    sv.precio_venta_pv,
    sv.precio_lista,
    sv.fcc,
    sv.fcr,
    sv.fcl,
    sv.fclr,
    sv.fecha_entrega_planificada,
    sv.fecha_entrega_real,
    sv.fecha_entrega_cliente,
    sv.fuente_ultima_sync,
    sv.fecha_sync_sap,
    sv.fecha_sync_comex,
    sv.observaciones_comex,
    sv.created_at AS staging_created_at,
    sv.updated_at AS staging_updated_at,
    sv.cond_pago,
    sv.situacion_inmatric,
    sv.fecha_inicio_inmatric,
    sv.fecha_titulo,
    sv.numero_titulo,
    sv.placa,
    sv.fecha_inscrito,
    sv.fecha_rep_placa,
    sv.fecha_rec_doc_car,
    sv.fecha_rec_doc,
    sv.fecha_em_doc,
    sv.fecha_obs_app,
    sv.fecha_cal_sunarp,
    sv.oficina_registral,
    sv.fecha_maxima_tramite,
    sv.fecha_cancelacion,
    sv.folio,
    sv.clase_operacion,
    sv.color,
    sv.cod_color,
    sv.tapiz,
    sv.cod_tapiz,
    sv.d_canal,
    sv.archivo_fuente,
    sv.fecha_confirmacion_fabrica,
    sv.fecha_salida_fabrica,
    sv.fecha_salida_carrocero,
    sv.fecha_soli_credito,
    sv.fecha_aprobacion_credito,
    sv.fecha_entrega_exp,
    sv.fecha_obs_sunarp,
    sv.fecha_reingresado,
    sv.zpca,
    sv.per_contingente,
    sv.fecha_recojo_transportista
   FROM (public.staging_vin sv
     LEFT JOIN public.tipo_vehiculo tv ON ((tv.id =
        CASE
            WHEN ((sv.linea_negocio)::text = 'VC'::text) THEN 1
            WHEN ((sv.linea_negocio)::text = 'Buses'::text) THEN 2
            WHEN ((sv.linea_negocio)::text = 'Maquinarias'::text) THEN 3
            WHEN ((sv.linea_negocio)::text = 'Autos'::text) THEN 4
            ELSE 2
        END)));


--
-- Name: alerta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta ALTER COLUMN id SET DEFAULT nextval('public.alerta_id_seq'::regclass);


--
-- Name: alerta_accion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta_accion ALTER COLUMN id SET DEFAULT nextval('public.alerta_accion_id_seq'::regclass);


--
-- Name: chat id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat ALTER COLUMN id SET DEFAULT nextval('public.chat_id_seq'::regclass);


--
-- Name: empresa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id SET DEFAULT nextval('public.empresa_id_seq'::regclass);


--
-- Name: fuentes_vin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuentes_vin ALTER COLUMN id SET DEFAULT nextval('public.fuentes_vin_id_seq'::regclass);


--
-- Name: grupo_paralelo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo_paralelo ALTER COLUMN id SET DEFAULT nextval('public.grupo_paralelo_id_seq'::regclass);


--
-- Name: hito id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito ALTER COLUMN id SET DEFAULT nextval('public.hito_id_seq'::regclass);


--
-- Name: hito_tipo_vehiculo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito_tipo_vehiculo ALTER COLUMN id SET DEFAULT nextval('public.hito_tipo_vehiculo_id_seq'::regclass);


--
-- Name: mapeo_campos_vin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mapeo_campos_vin ALTER COLUMN id SET DEFAULT nextval('public.mapeo_campos_vin_id_seq'::regclass);


--
-- Name: mensaje id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje ALTER COLUMN id SET DEFAULT nextval('public.mensaje_id_seq'::regclass);


--
-- Name: mensaje_etiqueta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje_etiqueta ALTER COLUMN id SET DEFAULT nextval('public.mensaje_etiqueta_id_seq'::regclass);


--
-- Name: notificacion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacion ALTER COLUMN id SET DEFAULT nextval('public.notificacion_id_seq'::regclass);


--
-- Name: sla_config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_config ALTER COLUMN id SET DEFAULT nextval('public.sla_config_id_seq'::regclass);


--
-- Name: subetapa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa ALTER COLUMN id SET DEFAULT nextval('public.subetapa_id_seq'::regclass);


--
-- Name: subetapa_tipo_vehiculo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa_tipo_vehiculo ALTER COLUMN id SET DEFAULT nextval('public.subetapa_tipo_vehiculo_id_seq'::regclass);


--
-- Name: tipo_vehiculo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_vehiculo ALTER COLUMN id SET DEFAULT nextval('public.tipo_vehiculo_id_seq'::regclass);


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Name: usuario_empresa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_empresa ALTER COLUMN id SET DEFAULT nextval('public.usuario_empresa_id_seq'::regclass);


--
-- Data for Name: alerta; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: alerta_accion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.empresa VALUES (1, 'Divemotor', 'DIV', '2026-03-11 14:55:30.82599', '2026-03-11 14:55:30.82599');
INSERT INTO public.empresa VALUES (2, 'Andes Motor', 'AND', '2026-03-11 14:55:30.82599', '2026-03-11 14:55:30.82599');
INSERT INTO public.empresa VALUES (3, 'Andes Maq', 'MAQ', '2026-03-11 14:55:30.82599', '2026-03-11 14:55:30.82599');


--
-- Data for Name: fuentes_vin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.fuentes_vin VALUES (1, 'Reporte Fichas', 'Reporte_fichas_*', 'Vin', true);
INSERT INTO public.fuentes_vin VALUES (2, 'Reporte Inmatriculación', 'Reporte_Inma_*', 'Vin', true);
INSERT INTO public.fuentes_vin VALUES (3, 'Proped', 'PROPED BUSES*', 'VIN', true);


--
-- Data for Name: grupo_paralelo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.grupo_paralelo VALUES (13, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (14, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (15, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (16, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (17, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (21, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (22, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: hito; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hito VALUES (3, 'PDI (Carrozado)', 'operativo', 2, true, '2026-03-11 14:55:30.83424', '2026-03-19 08:55:35.89191', 'wrench');
INSERT INTO public.hito VALUES (2, 'Asignación', 'financiero', 3, true, '2026-03-11 14:55:30.83424', '2026-03-19 11:41:23.280288', 'user-check');
INSERT INTO public.hito VALUES (1, 'Importación', 'financiero', 1, true, '2026-03-11 14:55:30.83424', '2026-03-19 12:06:29.830418', 'anchor');
INSERT INTO public.hito VALUES (4, 'Crédito', 'financiero', 4, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'credit-card');
INSERT INTO public.hito VALUES (5, 'Facturación', 'financiero', 5, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'file-text');
INSERT INTO public.hito VALUES (6, 'Pago', 'financiero', 6, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'banknote');
INSERT INTO public.hito VALUES (7, 'Inmatriculación', 'financiero', 7, true, '2026-03-11 14:55:30.83424', '2026-03-19 12:06:31.098409', 'file-badge');
INSERT INTO public.hito VALUES (8, 'Programación', 'financiero', 8, true, '2026-03-11 14:55:30.83424', '2026-03-19 12:06:31.500724', 'calendar-check');
INSERT INTO public.hito VALUES (9, 'Entrega', 'financiero', 9, true, '2026-03-11 14:55:30.83424', '2026-03-19 11:41:24.181913', 'truck');


--
-- Data for Name: hito_tipo_vehiculo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hito_tipo_vehiculo VALUES (106, 6, 21, 48, true, '2026-03-20 11:26:50.267011', '2026-03-20 11:39:02.256396', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (105, 5, 21, 46, true, '2026-03-20 11:26:50.256092', '2026-03-20 11:39:02.297014', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (107, 7, 21, 49, true, '2026-03-20 11:26:50.278877', '2026-03-20 11:39:10.023214', 'operativo', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (108, 8, 22, 50, true, '2026-03-20 11:26:50.339622', '2026-03-20 11:39:16.214212', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (109, 9, 22, 52, true, '2026-03-20 11:26:50.356838', '2026-03-20 11:39:16.247724', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (135, 8, 16, 8, true, '2026-03-20 11:26:59.428761', '2026-03-20 11:26:59.428761', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (136, 9, 16, 9, true, '2026-03-20 11:26:59.447607', '2026-03-20 11:26:59.447607', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (102, 3, 17, 3, true, '2026-03-20 11:26:50.191929', '2026-03-20 11:32:24.53934', 'operativo', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (104, 4, 13, 5, true, '2026-03-20 11:26:50.238001', '2026-03-20 11:34:11.714715', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (103, 2, 13, 4, true, '2026-03-20 11:26:50.22087', '2026-03-20 11:34:11.717267', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (101, 1, 17, 1, true, '2026-03-20 11:26:50.122344', '2026-03-20 11:32:24.564686', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (110, 1, 14, 1, true, '2026-03-20 11:26:52.931562', '2026-03-20 11:26:52.931562', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (111, 3, 14, 2, true, '2026-03-20 11:26:52.986288', '2026-03-20 11:26:52.986288', 'operativo', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (112, 2, 14, 3, true, '2026-03-20 11:26:53.01574', '2026-03-20 11:26:53.01574', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (113, 4, 14, 4, true, '2026-03-20 11:26:53.036419', '2026-03-20 11:26:53.036419', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (114, 5, 14, 5, true, '2026-03-20 11:26:53.054881', '2026-03-20 11:26:53.054881', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (115, 6, 14, 6, true, '2026-03-20 11:26:53.067883', '2026-03-20 11:26:53.067883', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (116, 7, 14, 7, true, '2026-03-20 11:26:53.08036', '2026-03-20 11:26:53.08036', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (117, 8, 14, 8, true, '2026-03-20 11:26:53.144393', '2026-03-20 11:26:53.144393', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (118, 9, 14, 9, true, '2026-03-20 11:26:53.161038', '2026-03-20 11:26:53.161038', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (119, 1, 15, 1, true, '2026-03-20 11:26:55.972058', '2026-03-20 11:26:55.972058', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (120, 3, 15, 2, true, '2026-03-20 11:26:56.027822', '2026-03-20 11:26:56.027822', 'operativo', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (121, 2, 15, 3, true, '2026-03-20 11:26:56.063803', '2026-03-20 11:26:56.063803', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (122, 4, 15, 4, true, '2026-03-20 11:26:56.082243', '2026-03-20 11:26:56.082243', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (123, 5, 15, 5, true, '2026-03-20 11:26:56.099379', '2026-03-20 11:26:56.099379', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (124, 6, 15, 6, true, '2026-03-20 11:26:56.111317', '2026-03-20 11:26:56.111317', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (125, 7, 15, 7, true, '2026-03-20 11:26:56.122604', '2026-03-20 11:26:56.122604', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (126, 8, 15, 8, true, '2026-03-20 11:26:56.184526', '2026-03-20 11:26:56.184526', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (127, 9, 15, 9, true, '2026-03-20 11:26:56.202958', '2026-03-20 11:26:56.202958', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (128, 1, 16, 1, true, '2026-03-20 11:26:59.199523', '2026-03-20 11:26:59.199523', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (129, 3, 16, 2, true, '2026-03-20 11:26:59.259832', '2026-03-20 11:26:59.259832', 'operativo', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (130, 2, 16, 3, true, '2026-03-20 11:26:59.291982', '2026-03-20 11:26:59.291982', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (131, 4, 16, 4, true, '2026-03-20 11:26:59.310834', '2026-03-20 11:26:59.310834', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (132, 5, 16, 5, true, '2026-03-20 11:26:59.329288', '2026-03-20 11:26:59.329288', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (133, 6, 16, 6, true, '2026-03-20 11:26:59.341483', '2026-03-20 11:26:59.341483', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (134, 7, 16, 7, true, '2026-03-20 11:26:59.354077', '2026-03-20 11:26:59.354077', 'financiero', 1);


--
-- Data for Name: mapeo_campos_vin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mapeo_campos_vin VALUES (1, 'cond_pago', 1, 'Cond. De pago', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (2, 'descripcion_cond_pago', 1, 'Descripción Cond pag', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (3, 'num_factura_comex', 3, 'NUMERO FACTURA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (4, 'precio_confirmado', 3, 'PRECIO CONFIRMADO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (5, 'pedido_interno', 3, 'PEDIDO INTERNO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (7, 'linea_negocio', 3, 'LINEA DE NEGOCIO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (9, 'cliente_comex', 3, 'CLIENTE ', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (10, 'estado_comex', 3, 'ESTADO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (11, 'modalidad_embarque', 3, 'MODALIDAD', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (12, 'transportista', 3, 'EMBARQUE', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (13, 'remonta', 3, 'REMONTA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (14, 'dias_prod_carr_planif', 3, 'DIAS PROD PLANIF', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (15, 'dias_prod_carr_real', 3, 'DIAS PROD REAL', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (16, 'observaciones_comex', 3, 'Observaciones', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (17, 'lote_asignado', 1, 'Lote.Asignado', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (18, 'id_ficha_sap', 1, 'Id.Ficha', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (20, 'pedido_venta_sap', 1, 'Pedido Venta', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (21, 'num_factura_sap', 1, 'Num Factura', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (23, 'modelo_facturacion', 1, 'Modelo Facturación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (24, 'num_declaracion', 1, 'N° Declaración', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (25, 'nombre_cliente_sap', 1, 'Descr.Cliente', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (26, 'cod_cliente_sap', 1, 'Cliente', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (27, 'cod_vendedor', 1, 'Vendedor', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (28, 'nombre_vendedor', 1, 'Descr.Vendedor', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (29, 'status_compra_sap', 1, 'Status Compra', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (30, 'estado_ficha_sap', 1, 'Estados', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (31, 'precio_venta_pv', 1, 'Precio Venta PV', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (32, 'precio_lista', 1, 'Precio Lista', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (33, 'sku', 1, 'ZSKU', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (34, 'matricula', 1, 'Matr.vehículo', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (35, 'situacion_inmatric', 2, 'Situacion de Imatric', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (36, 'fecha_inicio_inmatric', 2, 'Fecha Inicio Inmatri', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (37, 'fecha_titulo', 2, 'Fecha Titulo', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (38, 'numero_titulo', 2, 'Número Titulo', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (39, 'placa', 2, 'Placa', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (40, 'fecha_inscrito', 2, '013 Inscrito', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (41, 'fecha_rep_placa', 2, '026 Rep Placa', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (42, 'fecha_rec_doc_car', 2, '002 Rec.Doc Car', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (43, 'fecha_rec_doc', 2, '003 Rec.Doc', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (44, 'fecha_em_doc', 2, '001 Em.Doc', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (45, 'fecha_obs_app', 2, '061 Obs.App', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (46, 'fecha_cal_sunarp', 2, '007 Cal.Sunarp', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (47, 'oficina_registral', 2, 'Oficina Registral', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (48, 'fecha_maxima_tramite', 2, 'Fecha Maxima Tramite', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (49, 'fecha_cancelacion', 2, 'Fecha Cancelación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (50, 'folio', 2, 'Folio', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (51, 'clase_operacion', 2, 'Clase de operación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (52, 'color', 2, 'Color', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (53, 'cod_color', 2, 'Cod.Color', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (54, 'tapiz', 2, 'Tapiz', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (55, 'cod_tapiz', 2, 'Cod_tapiz', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (56, 'd_canal', 2, 'D.Canal', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (57, 'num_factura_sap', 2, 'Num Factura', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (58, 'num_declaracion', 2, 'N° Declaración', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (59, 'nombre_cliente_sap', 2, 'Descr.Cliente', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (60, 'id_ficha_sap', 2, 'Id.Ficha', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (61, 'nombre_vendedor', 2, 'Descr.Vendedor', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (62, 'modelo_facturacion', 2, 'Modelo Facturación', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (63, 'estado_ficha_sap', 2, 'Estados', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (65, 'matricula', 2, 'Matr.vehículo', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (66, 'lote_asignado', 2, 'Lote.Asignado', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (68, 'cod_cliente_sap', 2, 'Cliente', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (69, 'cod_vendedor', 2, 'Vendedor', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (70, 'pedido_venta_sap', 2, 'Pedido Venta', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (71, 'status_compra_sap', 2, 'Status Compra', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (72, 'sku', 2, 'ZSKU', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (73, 'fecha_asignacion', 2, 'Fecha Asignación', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (74, 'fcl', 2, 'FCL', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (75, 'fcc', 2, 'FCC', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (76, 'fcr', 2, 'FCR', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (77, 'fclr', 2, 'FCLR', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (78, 'fecha_facturacion_sap', 2, 'Fecha Facturación', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (79, 'fecha_entrega_cliente', 2, 'ENTREGA', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (80, 'fecha_embarque_sap', 2, 'Fecha Embarque', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (81, 'fecha_llegada_sap', 2, 'Fecha Llegada', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (82, 'fecha_aduana_sap', 2, 'Fecha Aduana', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (83, 'fecha_nacion', 2, 'Fecha Nación', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (84, 'fecha_preasignacion', 2, 'Fecha.Preasignacion', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (85, 'modelo_comercial', 3, 'MODELO DISPONIBILIDAD', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (22, 'modelo_comercial', 1, 'Modelo Comercial', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (64, 'modelo_comercial', 2, 'Modelo Comercial', 3, true);
INSERT INTO public.mapeo_campos_vin VALUES (86, 'fecha_colocacion', 3, 'FECHA DE COLOCACIÓN', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (87, 'per_contingente', 3, '#PER CONTINGENTE', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (19, 'pedido_externo', 1, 'Pedido Externo', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (6, 'pedido_externo', 3, 'PEDIDO EXTERNO', 3, true);
INSERT INTO public.mapeo_campos_vin VALUES (67, 'pedido_externo', 2, 'Pedido Externo', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (8, 'carrocero', 3, 'CARROCERO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (90, 'etd', 3, 'ETD', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (91, 'fecha_embarque_sap', 1, 'Fecha Embarque', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (92, 'eta', 3, 'ETA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (93, 'fecha_llegada_aduana', 3, 'Llegada aduana tacna ', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (94, 'fecha_llegada_aduana', 1, 'Fecha Llegada', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (95, 'fecha_ingreso_patio', 1, 'Fec.Ingreso Patio', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (97, 'fecha_recojo_carr_zcar', 3, 'FECHA RECOJO CARR (ZCAR)', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (98, 'fecha_ingreso_prod_carr_planif', 3, 'INGRESO LINEA PROD CARROCERO PLANIF', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (99, 'fecha_ingreso_prod_carr_real', 3, 'FECHA FINAL INGRESO PROD CARR', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (100, 'fecha_lib_prod_carr_planif', 3, 'FECHA FINAL DE PRODUCCION CARR (ZLIC)', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (88, 'fecha_liberacion_fabrica', 3, 'FECHA DE LIBERACIÓN', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (89, 'fecha_liberacion_fabrica', 1, 'Fecha Liberado', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (101, 'fecha_fin_prod_carr_real', 3, 'FECHA FINAL DE PRODUCCION CARR (ZLIC)', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (102, 'fecha_recojo_transportista', 3, 'RECOJO DE UNDS. TRANSPORTISTA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (103, 'fecha_salida_carrocero', 3, 'LIBERACIÓN PROD CARROCERO PLANIF', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (104, 'fecha_preasignacion', 1, 'Fecha Preasignación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (105, 'fecha_asignacion', 1, 'Fecha Asignación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (106, 'fecha_facturacion_sap', 1, 'Fecha Facturación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (107, 'fecha_cancelacion', 1, 'Fecha Cancelación', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (108, 'fecha_entrega_exp', 2, '061 Ent.Exp', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (109, 'fecha_obs_sunarp', 2, '008 Obse.Sunarp', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (110, 'fecha_reingresado', 2, '009 Reingrasado', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (115, 'fecha_entrega_cliente', 1, 'ENTREGA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (111, 'zpca', 1, 'ZPCA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (112, 'zpca', 1, 'ZPSA', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (114, 'fecha_entrega_planificada', 1, 'Fecha Entrega Pla.', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (113, 'fecha_entrega_planificada', 1, 'Fecha Entr. Vend', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (117, 'fcc', 1, 'FCR', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (116, 'fcl', 1, 'FCLR', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (118, 'fcc', 1, 'FCC', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (119, 'fcl', 1, 'FCL', 1, true);


--
-- Data for Name: mensaje; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: mensaje_etiqueta; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: sla_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sla_config VALUES (8, NULL, NULL, 5, 2, NULL, NULL, NULL);
INSERT INTO public.sla_config VALUES (10, NULL, 1, 5, 2, NULL, NULL, NULL);


--
-- Data for Name: subetapa; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subetapa VALUES (2, 1, 'Pedido fábrica', 2, NULL, NULL, '2026-03-20 11:21:44.83102', 'fecha_colocacion', NULL);
INSERT INTO public.subetapa VALUES (1, 1, 'Solicitud negocio', 1, NULL, NULL, '2026-03-20 11:21:44.832054', NULL, NULL);
INSERT INTO public.subetapa VALUES (6, 1, 'Embarque', 6, NULL, NULL, '2026-03-20 11:21:44.835179', 'fecha_embarque_sap', 'etd');
INSERT INTO public.subetapa VALUES (7, 1, 'Llegada', 7, NULL, NULL, '2026-03-20 11:21:44.835472', 'fecha_llegada_aduana', 'eta');
INSERT INTO public.subetapa VALUES (5, 1, 'Salida de fábrica', 5, NULL, NULL, '2026-03-20 11:21:44.836946', NULL, NULL);
INSERT INTO public.subetapa VALUES (3, 1, 'Confirmación fábrica', 3, NULL, NULL, '2026-03-20 11:21:44.839461', 'per_contingente', NULL);
INSERT INTO public.subetapa VALUES (4, 1, 'Liberación de pedido', 4, NULL, NULL, '2026-03-20 11:21:44.87673', 'fecha_liberacion_fabrica', NULL);
INSERT INTO public.subetapa VALUES (8, 1, 'En almacén', 8, NULL, NULL, '2026-03-20 11:21:44.879635', 'fecha_ingreso_patio', NULL);
INSERT INTO public.subetapa VALUES (10, 3, 'Inicio PDI', 2, NULL, NULL, '2026-03-20 11:22:39.014644', 'fecha_ingreso_prod_carr_real', 'fecha_ingreso_prod_carr_planif');
INSERT INTO public.subetapa VALUES (9, 3, 'Llegada Carrocero', 1, NULL, NULL, '2026-03-20 11:22:39.015657', 'fecha_recojo_carr_zcar', 'fecha_recojo_carr_zcar');
INSERT INTO public.subetapa VALUES (11, 3, 'Salida PDI', 3, NULL, NULL, '2026-03-20 11:22:39.016516', 'fecha_fin_prod_carr_real', 'fecha_lib_prod_carr_planif');
INSERT INTO public.subetapa VALUES (12, 3, 'Salida Carrocero', 4, NULL, NULL, '2026-03-20 11:22:39.017138', 'fecha_salida_carrocero', 'fecha_recojo_transportista');
INSERT INTO public.subetapa VALUES (20, 7, 'Recepción de documentos', 2, NULL, NULL, '2026-03-20 11:23:42.975896', 'fecha_rec_doc', NULL);
INSERT INTO public.subetapa VALUES (13, 2, 'Pre-Asignación', 1, NULL, NULL, NULL, 'fecha_preasignacion', NULL);
INSERT INTO public.subetapa VALUES (14, 2, 'Asig. Definitiva', 2, NULL, NULL, NULL, 'fecha_asignacion', NULL);
INSERT INTO public.subetapa VALUES (15, 4, 'Solicitud crédito', 1, NULL, NULL, NULL, 'fecha_soli_credito', NULL);
INSERT INTO public.subetapa VALUES (16, 4, 'Aprobación', 2, NULL, NULL, NULL, 'fecha_aprobacion_credito', NULL);
INSERT INTO public.subetapa VALUES (17, 5, 'Emisión factura', 1, NULL, NULL, NULL, 'fecha_facturacion_sap', NULL);
INSERT INTO public.subetapa VALUES (18, 6, 'Pago confirmado', 1, NULL, NULL, NULL, 'fecha_cancelacion', NULL);
INSERT INTO public.subetapa VALUES (22, 7, 'Entrega exp. a tramitador', 4, NULL, NULL, '2026-03-20 11:23:42.978653', 'fecha_entrega_exp', NULL);
INSERT INTO public.subetapa VALUES (31, 9, 'Entregado al Cliente', 1, NULL, NULL, NULL, 'fecha_entrega_cliente', 'fecha_entrega_planificada');
INSERT INTO public.subetapa VALUES (19, 7, 'Emisión de documentos', 1, NULL, NULL, '2026-03-20 11:23:42.980195', 'fecha_em_doc', NULL);
INSERT INTO public.subetapa VALUES (24, 7, 'Calificación SUNARP', 6, NULL, NULL, '2026-03-20 11:23:42.981242', 'fecha_cal_sunarp', NULL);
INSERT INTO public.subetapa VALUES (21, 7, 'Recep. doc Carrocería', 3, NULL, NULL, '2026-03-20 11:23:42.982547', 'fecha_rec_doc_car', NULL);
INSERT INTO public.subetapa VALUES (23, 7, 'Observado por AAP', 5, NULL, NULL, '2026-03-20 11:23:43.000358', 'fecha_obs_app', NULL);
INSERT INTO public.subetapa VALUES (25, 7, 'Observado SUNARP', 7, NULL, NULL, '2026-03-20 11:23:43.031633', 'fecha_obs_sunarp', NULL);
INSERT INTO public.subetapa VALUES (27, 7, 'Inscrito', 9, NULL, NULL, '2026-03-20 11:23:43.033009', 'fecha_inscrito', NULL);
INSERT INTO public.subetapa VALUES (26, 7, 'Reingresado', 8, NULL, NULL, '2026-03-20 11:23:43.034316', 'fecha_reingresado', NULL);
INSERT INTO public.subetapa VALUES (28, 7, 'Recepción de Placas de Rodaje', 10, NULL, NULL, '2026-03-20 11:23:43.035008', 'fecha_rep_placa', NULL);
INSERT INTO public.subetapa VALUES (30, 8, 'Fecha agendada', 2, NULL, NULL, '2026-03-20 11:23:58.796396', 'fecha_entrega_planificada', 'fcc');
INSERT INTO public.subetapa VALUES (29, 8, 'Unidad Lista', 1, NULL, NULL, '2026-03-20 11:23:58.797545', 'zpca', 'fcl');


--
-- Data for Name: subetapa_tipo_vehiculo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subetapa_tipo_vehiculo VALUES (233, 1, 1, true, '2026-03-20 11:26:50.132752', '2026-03-20 11:26:50.132752', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (234, 2, 2, true, '2026-03-20 11:26:50.142639', '2026-03-20 11:26:50.142639', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (235, 3, 3, true, '2026-03-20 11:26:50.149554', '2026-03-20 11:26:50.149554', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (236, 4, 4, true, '2026-03-20 11:26:50.155765', '2026-03-20 11:26:50.155765', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (237, 5, 5, true, '2026-03-20 11:26:50.165233', '2026-03-20 11:26:50.165233', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (238, 6, 6, true, '2026-03-20 11:26:50.171906', '2026-03-20 11:26:50.171906', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (239, 7, 7, true, '2026-03-20 11:26:50.179541', '2026-03-20 11:26:50.179541', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (240, 8, 8, true, '2026-03-20 11:26:50.185445', '2026-03-20 11:26:50.185445', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (241, 9, 1, true, '2026-03-20 11:26:50.198416', '2026-03-20 11:26:50.198416', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (242, 10, 2, true, '2026-03-20 11:26:50.204199', '2026-03-20 11:26:50.204199', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (243, 11, 3, true, '2026-03-20 11:26:50.210598', '2026-03-20 11:26:50.210598', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (244, 12, 4, true, '2026-03-20 11:26:50.215938', '2026-03-20 11:26:50.215938', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (245, 13, 1, true, '2026-03-20 11:26:50.227076', '2026-03-20 11:26:50.227076', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (246, 14, 2, true, '2026-03-20 11:26:50.233024', '2026-03-20 11:26:50.233024', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (247, 15, 1, true, '2026-03-20 11:26:50.245426', '2026-03-20 11:26:50.245426', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (248, 16, 2, true, '2026-03-20 11:26:50.251094', '2026-03-20 11:26:50.251094', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (249, 17, 1, true, '2026-03-20 11:26:50.261859', '2026-03-20 11:26:50.261859', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (250, 18, 1, true, '2026-03-20 11:26:50.272158', '2026-03-20 11:26:50.272158', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (251, 19, 1, true, '2026-03-20 11:26:50.284506', '2026-03-20 11:26:50.284506', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (252, 20, 2, true, '2026-03-20 11:26:50.289752', '2026-03-20 11:26:50.289752', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (253, 21, 3, true, '2026-03-20 11:26:50.29633', '2026-03-20 11:26:50.29633', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (254, 22, 4, true, '2026-03-20 11:26:50.301363', '2026-03-20 11:26:50.301363', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (255, 23, 5, true, '2026-03-20 11:26:50.306171', '2026-03-20 11:26:50.306171', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (256, 24, 6, true, '2026-03-20 11:26:50.312607', '2026-03-20 11:26:50.312607', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (257, 25, 7, true, '2026-03-20 11:26:50.318269', '2026-03-20 11:26:50.318269', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (258, 26, 8, true, '2026-03-20 11:26:50.323959', '2026-03-20 11:26:50.323959', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (259, 27, 9, true, '2026-03-20 11:26:50.329572', '2026-03-20 11:26:50.329572', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (260, 28, 10, true, '2026-03-20 11:26:50.334637', '2026-03-20 11:26:50.334637', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (261, 29, 1, true, '2026-03-20 11:26:50.34584', '2026-03-20 11:26:50.34584', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (262, 30, 2, true, '2026-03-20 11:26:50.351468', '2026-03-20 11:26:50.351468', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (263, 31, 1, true, '2026-03-20 11:26:50.3641', '2026-03-20 11:26:50.3641', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (264, 1, 1, true, '2026-03-20 11:26:52.938935', '2026-03-20 11:26:52.938935', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (265, 2, 2, true, '2026-03-20 11:26:52.945616', '2026-03-20 11:26:52.945616', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (266, 3, 3, true, '2026-03-20 11:26:52.951339', '2026-03-20 11:26:52.951339', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (267, 4, 4, true, '2026-03-20 11:26:52.957393', '2026-03-20 11:26:52.957393', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (268, 5, 5, true, '2026-03-20 11:26:52.963051', '2026-03-20 11:26:52.963051', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (269, 6, 6, true, '2026-03-20 11:26:52.968084', '2026-03-20 11:26:52.968084', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (270, 7, 7, true, '2026-03-20 11:26:52.975445', '2026-03-20 11:26:52.975445', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (271, 8, 8, true, '2026-03-20 11:26:52.981085', '2026-03-20 11:26:52.981085', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (272, 9, 1, true, '2026-03-20 11:26:52.993161', '2026-03-20 11:26:52.993161', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (273, 10, 2, true, '2026-03-20 11:26:52.998619', '2026-03-20 11:26:52.998619', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (274, 11, 3, true, '2026-03-20 11:26:53.004639', '2026-03-20 11:26:53.004639', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (275, 12, 4, true, '2026-03-20 11:26:53.010292', '2026-03-20 11:26:53.010292', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (276, 13, 1, true, '2026-03-20 11:26:53.024579', '2026-03-20 11:26:53.024579', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (277, 14, 2, true, '2026-03-20 11:26:53.030411', '2026-03-20 11:26:53.030411', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (278, 15, 1, true, '2026-03-20 11:26:53.04239', '2026-03-20 11:26:53.04239', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (279, 16, 2, true, '2026-03-20 11:26:53.048202', '2026-03-20 11:26:53.048202', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (280, 17, 1, true, '2026-03-20 11:26:53.062288', '2026-03-20 11:26:53.062288', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (281, 18, 1, true, '2026-03-20 11:26:53.07451', '2026-03-20 11:26:53.07451', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (282, 19, 1, true, '2026-03-20 11:26:53.086133', '2026-03-20 11:26:53.086133', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (283, 20, 2, true, '2026-03-20 11:26:53.093148', '2026-03-20 11:26:53.093148', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (284, 21, 3, true, '2026-03-20 11:26:53.098503', '2026-03-20 11:26:53.098503', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (285, 22, 4, true, '2026-03-20 11:26:53.103606', '2026-03-20 11:26:53.103606', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (286, 23, 5, true, '2026-03-20 11:26:53.109826', '2026-03-20 11:26:53.109826', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (287, 24, 6, true, '2026-03-20 11:26:53.115361', '2026-03-20 11:26:53.115361', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (288, 25, 7, true, '2026-03-20 11:26:53.121548', '2026-03-20 11:26:53.121548', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (289, 26, 8, true, '2026-03-20 11:26:53.12784', '2026-03-20 11:26:53.12784', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (290, 27, 9, true, '2026-03-20 11:26:53.13297', '2026-03-20 11:26:53.13297', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (291, 28, 10, true, '2026-03-20 11:26:53.138874', '2026-03-20 11:26:53.138874', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (292, 29, 1, true, '2026-03-20 11:26:53.149851', '2026-03-20 11:26:53.149851', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (293, 30, 2, true, '2026-03-20 11:26:53.155209', '2026-03-20 11:26:53.155209', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (294, 31, 1, true, '2026-03-20 11:26:53.166409', '2026-03-20 11:26:53.166409', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (295, 1, 1, true, '2026-03-20 11:26:55.978218', '2026-03-20 11:26:55.978218', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (296, 2, 2, true, '2026-03-20 11:26:55.983126', '2026-03-20 11:26:55.983126', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (297, 3, 3, true, '2026-03-20 11:26:55.98846', '2026-03-20 11:26:55.98846', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (298, 4, 4, true, '2026-03-20 11:26:55.993674', '2026-03-20 11:26:55.993674', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (299, 5, 5, true, '2026-03-20 11:26:55.999044', '2026-03-20 11:26:55.999044', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (300, 6, 6, true, '2026-03-20 11:26:56.004801', '2026-03-20 11:26:56.004801', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (301, 7, 7, true, '2026-03-20 11:26:56.01119', '2026-03-20 11:26:56.01119', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (302, 8, 8, true, '2026-03-20 11:26:56.01933', '2026-03-20 11:26:56.01933', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (303, 9, 1, true, '2026-03-20 11:26:56.034104', '2026-03-20 11:26:56.034104', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (304, 10, 2, true, '2026-03-20 11:26:56.04307', '2026-03-20 11:26:56.04307', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (305, 11, 3, true, '2026-03-20 11:26:56.049211', '2026-03-20 11:26:56.049211', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (306, 12, 4, true, '2026-03-20 11:26:56.055158', '2026-03-20 11:26:56.055158', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (307, 13, 1, true, '2026-03-20 11:26:56.069756', '2026-03-20 11:26:56.069756', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (308, 14, 2, true, '2026-03-20 11:26:56.076548', '2026-03-20 11:26:56.076548', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (309, 15, 1, true, '2026-03-20 11:26:56.088666', '2026-03-20 11:26:56.088666', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (310, 16, 2, true, '2026-03-20 11:26:56.094255', '2026-03-20 11:26:56.094255', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (311, 17, 1, true, '2026-03-20 11:26:56.10531', '2026-03-20 11:26:56.10531', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (312, 18, 1, true, '2026-03-20 11:26:56.116675', '2026-03-20 11:26:56.116675', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (313, 19, 1, true, '2026-03-20 11:26:56.128971', '2026-03-20 11:26:56.128971', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (314, 20, 2, true, '2026-03-20 11:26:56.13428', '2026-03-20 11:26:56.13428', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (315, 21, 3, true, '2026-03-20 11:26:56.141374', '2026-03-20 11:26:56.141374', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (316, 22, 4, true, '2026-03-20 11:26:56.146943', '2026-03-20 11:26:56.146943', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (317, 23, 5, true, '2026-03-20 11:26:56.152856', '2026-03-20 11:26:56.152856', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (318, 24, 6, true, '2026-03-20 11:26:56.15853', '2026-03-20 11:26:56.15853', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (319, 25, 7, true, '2026-03-20 11:26:56.16363', '2026-03-20 11:26:56.16363', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (320, 26, 8, true, '2026-03-20 11:26:56.168498', '2026-03-20 11:26:56.168498', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (321, 27, 9, true, '2026-03-20 11:26:56.174267', '2026-03-20 11:26:56.174267', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (322, 28, 10, true, '2026-03-20 11:26:56.179386', '2026-03-20 11:26:56.179386', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (323, 29, 1, true, '2026-03-20 11:26:56.191401', '2026-03-20 11:26:56.191401', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (324, 30, 2, true, '2026-03-20 11:26:56.197598', '2026-03-20 11:26:56.197598', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (325, 31, 1, true, '2026-03-20 11:26:56.20952', '2026-03-20 11:26:56.20952', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (326, 1, 1, true, '2026-03-20 11:26:59.206407', '2026-03-20 11:26:59.206407', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (327, 2, 2, true, '2026-03-20 11:26:59.213989', '2026-03-20 11:26:59.213989', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (328, 3, 3, true, '2026-03-20 11:26:59.219889', '2026-03-20 11:26:59.219889', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (329, 4, 4, true, '2026-03-20 11:26:59.227409', '2026-03-20 11:26:59.227409', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (330, 5, 5, true, '2026-03-20 11:26:59.233819', '2026-03-20 11:26:59.233819', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (331, 6, 6, true, '2026-03-20 11:26:59.241629', '2026-03-20 11:26:59.241629', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (332, 7, 7, true, '2026-03-20 11:26:59.247528', '2026-03-20 11:26:59.247528', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (333, 8, 8, true, '2026-03-20 11:26:59.253383', '2026-03-20 11:26:59.253383', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (334, 9, 1, true, '2026-03-20 11:26:59.265611', '2026-03-20 11:26:59.265611', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (335, 10, 2, true, '2026-03-20 11:26:59.27093', '2026-03-20 11:26:59.27093', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (336, 11, 3, true, '2026-03-20 11:26:59.278787', '2026-03-20 11:26:59.278787', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (337, 12, 4, true, '2026-03-20 11:26:59.285334', '2026-03-20 11:26:59.285334', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (338, 13, 1, true, '2026-03-20 11:26:59.297654', '2026-03-20 11:26:59.297654', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (339, 14, 2, true, '2026-03-20 11:26:59.303164', '2026-03-20 11:26:59.303164', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (340, 15, 1, true, '2026-03-20 11:26:59.316847', '2026-03-20 11:26:59.316847', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (341, 16, 2, true, '2026-03-20 11:26:59.323177', '2026-03-20 11:26:59.323177', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (342, 17, 1, true, '2026-03-20 11:26:59.334662', '2026-03-20 11:26:59.334662', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (343, 18, 1, true, '2026-03-20 11:26:59.348106', '2026-03-20 11:26:59.348106', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (344, 19, 1, true, '2026-03-20 11:26:59.360576', '2026-03-20 11:26:59.360576', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (345, 20, 2, true, '2026-03-20 11:26:59.365855', '2026-03-20 11:26:59.365855', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (346, 21, 3, true, '2026-03-20 11:26:59.372365', '2026-03-20 11:26:59.372365', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (347, 22, 4, true, '2026-03-20 11:26:59.380435', '2026-03-20 11:26:59.380435', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (348, 23, 5, true, '2026-03-20 11:26:59.386925', '2026-03-20 11:26:59.386925', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (349, 24, 6, true, '2026-03-20 11:26:59.394611', '2026-03-20 11:26:59.394611', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (350, 25, 7, true, '2026-03-20 11:26:59.402076', '2026-03-20 11:26:59.402076', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (351, 26, 8, true, '2026-03-20 11:26:59.409257', '2026-03-20 11:26:59.409257', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (352, 27, 9, true, '2026-03-20 11:26:59.415734', '2026-03-20 11:26:59.415734', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (353, 28, 10, true, '2026-03-20 11:26:59.422497', '2026-03-20 11:26:59.422497', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (354, 29, 1, true, '2026-03-20 11:26:59.434826', '2026-03-20 11:26:59.434826', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (355, 30, 2, true, '2026-03-20 11:26:59.441765', '2026-03-20 11:26:59.441765', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (356, 31, 1, true, '2026-03-20 11:26:59.455225', '2026-03-20 11:26:59.455225', 1);


--
-- Data for Name: tipo_vehiculo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tipo_vehiculo VALUES (1, 'Camión', '#2E75B6', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417', 'truck');
INSERT INTO public.tipo_vehiculo VALUES (2, 'Bus', '#7C3AED', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417', 'bus-front');
INSERT INTO public.tipo_vehiculo VALUES (3, 'Maquinaria', '#EA580C', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417', 'hard-hat');
INSERT INTO public.tipo_vehiculo VALUES (4, 'Vehículo Ligero', '#0EA5E9', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417', 'car');


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuario VALUES (1, '00000000-0000-4000-8000-000000000001', 'Developer Kaufmann', 'dev@kaufmann.cl', 'superadministrador', true, NULL, '2026-03-18 15:17:21.813206');


--
-- Data for Name: usuario_empresa; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuario_empresa VALUES (1, 1, 1);
INSERT INTO public.usuario_empresa VALUES (2, 1, 2);
INSERT INTO public.usuario_empresa VALUES (3, 1, 3);


--
-- Name: alerta_accion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.alerta_accion_id_seq', 1, false);


--
-- Name: alerta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.alerta_id_seq', 1, false);


--
-- Name: chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_id_seq', 1, false);


--
-- Name: empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empresa_id_seq', 3, true);


--
-- Name: fuentes_vin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fuentes_vin_id_seq', 3, true);


--
-- Name: grupo_paralelo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grupo_paralelo_id_seq', 22, true);


--
-- Name: hito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hito_id_seq', 9, true);


--
-- Name: hito_tipo_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hito_tipo_vehiculo_id_seq', 136, true);


--
-- Name: mapeo_campos_vin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mapeo_campos_vin_id_seq', 119, true);


--
-- Name: mensaje_etiqueta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mensaje_etiqueta_id_seq', 1, false);


--
-- Name: mensaje_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mensaje_id_seq', 1, false);


--
-- Name: notificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notificacion_id_seq', 1, false);


--
-- Name: sla_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sla_config_id_seq', 10, true);


--
-- Name: subetapa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subetapa_id_seq', 31, true);


--
-- Name: subetapa_tipo_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subetapa_tipo_vehiculo_id_seq', 356, true);


--
-- Name: tipo_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_vehiculo_id_seq', 5, true);


--
-- Name: usuario_empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_empresa_id_seq', 3, true);


--
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_seq', 2, true);


--
-- Name: alerta_accion alerta_accion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta_accion
    ADD CONSTRAINT alerta_accion_pkey PRIMARY KEY (id);


--
-- Name: alerta alerta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_pkey PRIMARY KEY (id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id);


--
-- Name: fuentes_vin fuentes_vin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuentes_vin
    ADD CONSTRAINT fuentes_vin_pkey PRIMARY KEY (id);


--
-- Name: grupo_paralelo grupo_paralelo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupo_paralelo
    ADD CONSTRAINT grupo_paralelo_pkey PRIMARY KEY (id);


--
-- Name: hito hito_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito
    ADD CONSTRAINT hito_pkey PRIMARY KEY (id);


--
-- Name: mapeo_campos_vin mapeo_campos_vin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mapeo_campos_vin
    ADD CONSTRAINT mapeo_campos_vin_pkey PRIMARY KEY (id);


--
-- Name: mensaje_etiqueta mensaje_etiqueta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje_etiqueta
    ADD CONSTRAINT mensaje_etiqueta_pkey PRIMARY KEY (id);


--
-- Name: mensaje mensaje_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_pkey PRIMARY KEY (id);


--
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id);


--
-- Name: hito_tipo_vehiculo pk_hito_tipo_vehiculo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito_tipo_vehiculo
    ADD CONSTRAINT pk_hito_tipo_vehiculo PRIMARY KEY (id);


--
-- Name: subetapa_tipo_vehiculo pk_subetapa_tipo_vehiculo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa_tipo_vehiculo
    ADD CONSTRAINT pk_subetapa_tipo_vehiculo PRIMARY KEY (id);


--
-- Name: sla_config sla_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_config
    ADD CONSTRAINT sla_config_pkey PRIMARY KEY (id);


--
-- Name: staging_vin staging_vin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staging_vin
    ADD CONSTRAINT staging_vin_pkey PRIMARY KEY (vin);


--
-- Name: subetapa subetapa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa
    ADD CONSTRAINT subetapa_pkey PRIMARY KEY (id);


--
-- Name: tipo_vehiculo tipo_vehiculo_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_vehiculo
    ADD CONSTRAINT tipo_vehiculo_nombre_key UNIQUE (nombre);


--
-- Name: tipo_vehiculo tipo_vehiculo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_vehiculo
    ADD CONSTRAINT tipo_vehiculo_pkey PRIMARY KEY (id);


--
-- Name: empresa uq_empresa_codigo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT uq_empresa_codigo UNIQUE (codigo);


--
-- Name: hito_tipo_vehiculo uq_hito_tipo_vehiculo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito_tipo_vehiculo
    ADD CONSTRAINT uq_hito_tipo_vehiculo UNIQUE (hito_id, tipo_vehiculo_id);


--
-- Name: subetapa_tipo_vehiculo uq_subetapa_tipo_vehiculo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa_tipo_vehiculo
    ADD CONSTRAINT uq_subetapa_tipo_vehiculo UNIQUE (subetapa_id, tipo_vehiculo_id);


--
-- Name: usuario uq_usuario_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT uq_usuario_email UNIQUE (email);


--
-- Name: usuario_empresa uq_usuario_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT uq_usuario_empresa UNIQUE (usuario_id, empresa_id);


--
-- Name: usuario uq_usuario_oid; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT uq_usuario_oid UNIQUE (azure_ad_oid);


--
-- Name: usuario_empresa usuario_empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT usuario_empresa_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: idx_alerta_nivel_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerta_nivel_estado ON public.alerta USING btree (nivel, estado_alerta);


--
-- Name: idx_alerta_vin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerta_vin_id ON public.alerta USING btree (vin_id);


--
-- Name: idx_mensaje_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mensaje_chat_id ON public.mensaje USING btree (chat_id);


--
-- Name: idx_sla_empresa_subetapa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sla_empresa_subetapa ON public.sla_config USING btree (empresa_id, subetapa_id);


--
-- Name: idx_staging_fuente_sync; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staging_fuente_sync ON public.staging_vin USING btree (fuente_ultima_sync);


--
-- Name: idx_staging_pedido_externo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staging_pedido_externo ON public.staging_vin USING btree (pedido_externo);


--
-- Name: alerta_accion alerta_accion_alerta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta_accion
    ADD CONSTRAINT alerta_accion_alerta_id_fkey FOREIGN KEY (alerta_id) REFERENCES public.alerta(id);


--
-- Name: alerta_accion alerta_accion_usuario_accion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta_accion
    ADD CONSTRAINT alerta_accion_usuario_accion_id_fkey FOREIGN KEY (usuario_accion_id) REFERENCES public.usuario(id);


--
-- Name: alerta alerta_hito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_hito_id_fkey FOREIGN KEY (hito_id) REFERENCES public.hito(id);


--
-- Name: alerta alerta_usuario_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_usuario_responsable_id_fkey FOREIGN KEY (usuario_responsable_id) REFERENCES public.usuario(id);


--
-- Name: hito_tipo_vehiculo fk_htv_grupo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito_tipo_vehiculo
    ADD CONSTRAINT fk_htv_grupo FOREIGN KEY (grupo_paralelo_id) REFERENCES public.grupo_paralelo(id) ON DELETE SET NULL;


--
-- Name: hito_tipo_vehiculo fk_htv_hito; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito_tipo_vehiculo
    ADD CONSTRAINT fk_htv_hito FOREIGN KEY (hito_id) REFERENCES public.hito(id) ON DELETE CASCADE;


--
-- Name: hito_tipo_vehiculo fk_htv_tipo_vehiculo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hito_tipo_vehiculo
    ADD CONSTRAINT fk_htv_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES public.tipo_vehiculo(id);


--
-- Name: sla_config fk_sla_tipo_vehiculo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_config
    ADD CONSTRAINT fk_sla_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES public.tipo_vehiculo(id);


--
-- Name: subetapa_tipo_vehiculo fk_stv_subetapa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa_tipo_vehiculo
    ADD CONSTRAINT fk_stv_subetapa FOREIGN KEY (subetapa_id) REFERENCES public.subetapa(id) ON DELETE CASCADE;


--
-- Name: subetapa_tipo_vehiculo fk_stv_tipo_vehiculo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa_tipo_vehiculo
    ADD CONSTRAINT fk_stv_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES public.tipo_vehiculo(id);


--
-- Name: mapeo_campos_vin mapeo_campos_vin_id_fuente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mapeo_campos_vin
    ADD CONSTRAINT mapeo_campos_vin_id_fuente_fkey FOREIGN KEY (id_fuente) REFERENCES public.fuentes_vin(id) ON DELETE RESTRICT;


--
-- Name: mensaje mensaje_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id);


--
-- Name: mensaje_etiqueta mensaje_etiqueta_mensaje_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje_etiqueta
    ADD CONSTRAINT mensaje_etiqueta_mensaje_id_fkey FOREIGN KEY (mensaje_id) REFERENCES public.mensaje(id);


--
-- Name: mensaje_etiqueta mensaje_etiqueta_usuario_etiquetado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje_etiqueta
    ADD CONSTRAINT mensaje_etiqueta_usuario_etiquetado_id_fkey FOREIGN KEY (usuario_etiquetado_id) REFERENCES public.usuario(id);


--
-- Name: mensaje mensaje_usuario_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_usuario_autor_id_fkey FOREIGN KEY (usuario_autor_id) REFERENCES public.usuario(id);


--
-- Name: notificacion notificacion_mensaje_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_mensaje_id_fkey FOREIGN KEY (mensaje_id) REFERENCES public.mensaje(id);


--
-- Name: notificacion notificacion_usuario_destino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_usuario_destino_id_fkey FOREIGN KEY (usuario_destino_id) REFERENCES public.usuario(id);


--
-- Name: sla_config sla_config_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_config
    ADD CONSTRAINT sla_config_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id);


--
-- Name: sla_config sla_config_subetapa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_config
    ADD CONSTRAINT sla_config_subetapa_id_fkey FOREIGN KEY (subetapa_id) REFERENCES public.subetapa(id);


--
-- Name: subetapa subetapa_hito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subetapa
    ADD CONSTRAINT subetapa_hito_id_fkey FOREIGN KEY (hito_id) REFERENCES public.hito(id);


--
-- Name: usuario_empresa usuario_empresa_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT usuario_empresa_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id);


--
-- Name: usuario_empresa usuario_empresa_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT usuario_empresa_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5I6KhoPRtXFWyNbFo8ptkCMbJRobSqEGeXhBqz7BV1hoytIvEBbC9eY3tbetG3H

