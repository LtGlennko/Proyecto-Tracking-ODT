--
-- PostgreSQL database dump
--

\restrict lrJeMf8wTLcb6rhGlt83XD4FIRnLPr5l0Kd5ad6JuKTN3GOSAsmJ1KVaVFpFf7s

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
    ficha_id integer,
    vin_id character varying(50),
    created_at timestamp without time zone,
    CONSTRAINT chk_chat_xor CHECK (((ficha_id IS NULL) <> (vin_id IS NULL)))
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
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id integer NOT NULL,
    empresa_id integer,
    nombre character varying(255),
    ruc character varying(50),
    is_vic boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cliente_id_seq OWNED BY public.cliente.id;


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
-- Name: ficha; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ficha (
    id integer NOT NULL,
    cliente_id integer,
    codigo character varying(100),
    fecha_creacion date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    ejecutivo character varying
);


--
-- Name: ficha_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ficha_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ficha_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ficha_id_seq OWNED BY public.ficha.id;


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
    archivo_fuente character varying(255)
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
    slug character varying(50) NOT NULL,
    color character varying(20),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: vin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vin (
    id character varying(50) NOT NULL,
    ficha_id integer,
    marca character varying(100),
    ultima_actualizacion timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    tipo_vehiculo_id integer
);


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
-- Name: cliente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id SET DEFAULT nextval('public.cliente_id_seq'::regclass);


--
-- Name: empresa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id SET DEFAULT nextval('public.empresa_id_seq'::regclass);


--
-- Name: ficha id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ficha ALTER COLUMN id SET DEFAULT nextval('public.ficha_id_seq'::regclass);


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
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cliente VALUES (1, 1, 'Transportes del Norte S.A.', '20100100100', false, NULL, NULL);
INSERT INTO public.cliente VALUES (2, 1, 'Turismo Andes S.A.', '20200200200', false, NULL, NULL);
INSERT INTO public.cliente VALUES (3, 2, 'Renting Corporativo S.A.C.', '20300300300', false, NULL, NULL);
INSERT INTO public.cliente VALUES (4, 3, 'Constructora del Sur S.A.', '20400400400', false, NULL, NULL);
INSERT INTO public.cliente VALUES (5, 1, 'Transportes Línea S.A.', '20500500500', true, NULL, NULL);


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.empresa VALUES (1, 'Divemotor', 'DIV', '2026-03-11 14:55:30.82599', '2026-03-11 14:55:30.82599');
INSERT INTO public.empresa VALUES (2, 'Andes Motor', 'AND', '2026-03-11 14:55:30.82599', '2026-03-11 14:55:30.82599');
INSERT INTO public.empresa VALUES (3, 'Andes Maq', 'MAQ', '2026-03-11 14:55:30.82599', '2026-03-11 14:55:30.82599');


--
-- Data for Name: ficha; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ficha VALUES (1, 1, 'F-2025-884', '2025-10-20', NULL, NULL, 'Juan Pérez');
INSERT INTO public.ficha VALUES (2, 2, 'F-2025-999', '2025-11-05', NULL, NULL, 'Roberto Gomez');
INSERT INTO public.ficha VALUES (3, 3, 'F-2025-901', '2025-10-01', NULL, NULL, 'Maria Lopez');
INSERT INTO public.ficha VALUES (4, 4, 'F-MAQ-2025-01', '2025-12-10', NULL, NULL, 'Carlos Ruiz');
INSERT INTO public.ficha VALUES (5, 5, 'F-BUS-2025-02', '2025-11-15', NULL, NULL, 'Ana Torres');


--
-- Data for Name: fuentes_vin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.fuentes_vin VALUES (1, 'Reporte Fichas', 'Reporte_fichas_*', 'Vin', true);
INSERT INTO public.fuentes_vin VALUES (2, 'Reporte Inmatriculación', 'Reporte_Inma_*', 'Vin', true);
INSERT INTO public.fuentes_vin VALUES (3, 'Proped', 'PROPED BUSES*', 'VIN', true);


--
-- Data for Name: grupo_paralelo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.grupo_paralelo VALUES (2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (3, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (4, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (5, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (6, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (7, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (8, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (9, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.grupo_paralelo VALUES (10, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: hito; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hito VALUES (1, 'Importación', 'operativo', 1, true, '2026-03-11 14:55:30.83424', '2026-03-18 15:17:38.85304', 'anchor');
INSERT INTO public.hito VALUES (2, 'Asignación', 'comercial', 2, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'user-check');
INSERT INTO public.hito VALUES (4, 'Crédito', 'financiero', 4, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'credit-card');
INSERT INTO public.hito VALUES (5, 'Facturación', 'financiero', 5, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'file-text');
INSERT INTO public.hito VALUES (6, 'Pago', 'financiero', 6, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'banknote');
INSERT INTO public.hito VALUES (7, 'Inmatriculación', 'operativo', 7, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'file-badge');
INSERT INTO public.hito VALUES (8, 'Programación', 'operativo', 8, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'calendar-check');
INSERT INTO public.hito VALUES (9, 'Entrega', 'comercial', 9, true, '2026-03-11 14:55:30.83424', '2026-03-11 14:55:30.83424', 'truck');
INSERT INTO public.hito VALUES (3, 'PDI', 'operativo', 3, true, '2026-03-11 14:55:30.83424', '2026-03-19 08:55:35.89191', 'wrench');


--
-- Data for Name: hito_tipo_vehiculo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hito_tipo_vehiculo VALUES (65, 1, 4, 1, true, '2026-03-13 15:11:17.021546', '2026-03-13 15:11:17.021546', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (66, 2, 4, 2, true, '2026-03-13 15:11:17.095944', '2026-03-13 15:11:17.095944', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (68, 4, 4, 4, true, '2026-03-13 15:11:17.1473', '2026-03-13 15:11:17.1473', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (69, 5, 4, 5, true, '2026-03-13 15:11:17.171798', '2026-03-13 15:11:17.171798', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (70, 6, 4, 6, true, '2026-03-13 15:11:17.185805', '2026-03-13 15:11:17.185805', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (71, 7, 4, 7, true, '2026-03-13 15:11:17.198562', '2026-03-13 15:11:17.198562', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (72, 8, 4, 8, true, '2026-03-13 15:11:17.217532', '2026-03-13 15:11:17.217532', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (73, 9, 4, 9, true, '2026-03-13 15:11:17.234781', '2026-03-13 15:11:17.234781', 'financiero', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (74, 1, 5, 1, true, '2026-03-13 15:13:48.461868', '2026-03-13 15:13:48.461868', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (75, 2, 5, 2, true, '2026-03-13 15:13:48.521426', '2026-03-13 15:13:48.521426', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (76, 3, 5, 3, true, '2026-03-13 15:13:48.543939', '2026-03-13 15:13:48.543939', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (78, 5, 5, 5, true, '2026-03-13 15:13:48.603129', '2026-03-13 15:13:48.603129', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (79, 6, 5, 6, true, '2026-03-13 15:13:48.619023', '2026-03-13 15:13:48.619023', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (80, 7, 5, 7, true, '2026-03-13 15:13:48.634287', '2026-03-13 15:13:48.634287', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (81, 8, 5, 8, true, '2026-03-13 15:13:48.654781', '2026-03-13 15:13:48.654781', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (54, 8, 2, 8, false, '2026-03-13 09:47:49.419143', '2026-03-13 15:22:08.001892', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (53, 7, 2, 10, true, '2026-03-13 09:47:49.403486', '2026-03-13 15:22:11.951959', 'operativo', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (52, 6, 2, 6, false, '2026-03-13 09:47:49.393658', '2026-03-13 15:22:15.197741', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (51, 5, 2, 5, false, '2026-03-13 09:47:49.383278', '2026-03-13 15:22:15.89624', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (50, 4, 2, 4, false, '2026-03-13 09:47:49.366555', '2026-03-13 15:22:16.433115', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (49, 3, 2, 3, false, '2026-03-13 09:47:49.34395', '2026-03-13 15:22:17.505579', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (48, 2, 6, 11, true, '2026-03-13 09:47:49.327728', '2026-03-13 15:22:21.69856', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (62, 7, 3, 7, false, '2026-03-13 09:47:54.187856', '2026-03-13 15:36:49.066131', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (61, 6, 3, 6, false, '2026-03-13 09:47:54.176612', '2026-03-13 15:36:49.952529', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (60, 5, 3, 5, false, '2026-03-13 09:47:54.164973', '2026-03-13 15:36:50.329499', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (63, 8, 7, 10, true, '2026-03-13 09:47:54.204862', '2026-03-13 15:36:53.32814', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (58, 3, 7, 11, true, '2026-03-13 09:47:54.127409', '2026-03-13 15:36:56.170531', 'operativo', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (64, 9, 3, 9, false, '2026-03-13 09:47:54.222888', '2026-03-13 15:36:57.066965', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (59, 4, 3, 4, false, '2026-03-13 09:47:54.149046', '2026-03-13 15:36:58.117839', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (57, 2, 8, 12, true, '2026-03-13 09:47:54.108246', '2026-03-13 15:37:04.154859', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (55, 9, 9, 12, false, '2026-03-13 09:47:49.437125', '2026-03-13 16:20:37.796841', 'operativo', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (47, 1, 2, 1, true, '2026-03-13 09:47:49.275858', '2026-03-13 09:47:49.275858', 'financiero', 1);
INSERT INTO public.hito_tipo_vehiculo VALUES (56, 1, 3, 1, true, '2026-03-13 09:47:54.063878', '2026-03-13 09:47:54.063878', 'financiero', 2);
INSERT INTO public.hito_tipo_vehiculo VALUES (67, 3, 4, 10, true, '2026-03-13 15:11:17.119659', '2026-03-18 09:15:46.004511', 'operativo', 3);
INSERT INTO public.hito_tipo_vehiculo VALUES (82, 9, 10, 10, true, '2026-03-13 15:13:48.674704', '2026-03-18 09:15:50.193879', 'financiero', 4);
INSERT INTO public.hito_tipo_vehiculo VALUES (77, 4, 10, 11, true, '2026-03-13 15:13:48.5742', '2026-03-18 09:15:52.171221', 'operativo', 4);


--
-- Data for Name: mapeo_campos_vin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mapeo_campos_vin VALUES (1, 'cond_pago', 1, 'Cond. De pago', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (2, 'descripcion_cond_pago', 1, 'Descripción Cond pag', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (3, 'num_factura_comex', 3, 'NUMERO FACTURA', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (4, 'precio_confirmado', 3, 'PRECIO CONFIRMADO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (5, 'pedido_interno', 3, 'PEDIDO INTERNO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (7, 'linea_negocio', 3, 'LINEA DE NEGOCIO', 1, true);
INSERT INTO public.mapeo_campos_vin VALUES (8, 'carrocero', 3, 'CARROCERO', 1, true);
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
INSERT INTO public.mapeo_campos_vin VALUES (22, 'modelo_comercial', 1, 'Modelo Comercial', 1, true);
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
INSERT INTO public.mapeo_campos_vin VALUES (64, 'modelo_comercial', 2, 'Modelo Comercial', 2, true);
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
INSERT INTO public.mapeo_campos_vin VALUES (19, 'pedido_externo', 1, 'Pedido Externo', 2, true);
INSERT INTO public.mapeo_campos_vin VALUES (6, 'pedido_externo', 3, 'PEDIDO EXTERNO', 3, true);
INSERT INTO public.mapeo_campos_vin VALUES (67, 'pedido_externo', 2, 'Pedido Externo', 1, true);


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


--
-- Data for Name: staging_vin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staging_vin VALUES ('WDB9988776655AABC1', 'LOTE-2025-A12', NULL, 'OC-00198', NULL, NULL, 'VC', NULL, 'Actros 2651', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Juan Pérez', NULL, NULL, NULL, '2025-10-22', NULL, '2025-11-08', NULL, NULL, NULL, NULL, NULL, '2025-11-10', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-10', '2025-11-18', NULL, NULL, NULL, NULL, NULL, '2025-11-20', NULL, '2025-11-21', '2025-11-22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-01', NULL, NULL, NULL, NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD00', 'Contado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('WDB9988776655AABC2', 'LOTE-2025-A12', NULL, 'OC-00199', NULL, NULL, 'VC', NULL, 'Atego 1726', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Juan Pérez', NULL, NULL, NULL, '2025-10-21', NULL, '2025-11-05', NULL, NULL, NULL, '2025-12-01', NULL, '2025-12-06', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-08', '2025-11-15', NULL, NULL, NULL, NULL, NULL, '2025-11-19', '2025-12-08', '2025-11-20', '2025-11-22', NULL, NULL, '2025-12-07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD00', 'Contado', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('WDBBUS44556601BUS1', 'LOTE-BUS-01', NULL, 'OC-00210', NULL, NULL, 'Buses', NULL, 'O 500 RSD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Roberto Gomez', NULL, NULL, NULL, '2025-11-06', NULL, '2025-11-20', NULL, NULL, NULL, '2025-12-26', NULL, '2025-12-30', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-25', '2025-12-02', NULL, NULL, NULL, NULL, NULL, '2025-12-14', '2026-01-02', '2025-12-16', '2025-12-17', NULL, NULL, '2026-01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD30', 'Pago a 30 días', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('WDBBUS44556602BUS2', 'LOTE-BUS-01', NULL, 'OC-00211', NULL, NULL, 'Buses', NULL, 'O 500 RSD 2442', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Roberto Gomez', NULL, NULL, NULL, '2025-11-08', NULL, '2025-11-22', NULL, NULL, NULL, '2025-12-29', NULL, '2026-01-02', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28', '2025-12-05', NULL, NULL, NULL, NULL, NULL, '2025-12-16', '2026-01-05', '2025-12-17', '2025-12-18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD30', 'Pago a 30 días', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('JEEP1C4HJXEG8MW123', 'LOTE-AUTO-03', NULL, 'OC-00220', NULL, NULL, 'Autos', NULL, 'Commander', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Maria Lopez', NULL, NULL, NULL, '2025-10-02', NULL, '2025-10-15', NULL, NULL, NULL, '2025-11-02', NULL, '2025-11-05', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-18', '2025-10-25', NULL, NULL, NULL, NULL, NULL, '2025-10-29', '2025-11-10', '2025-10-31', '2025-11-01', NULL, NULL, '2025-11-06', NULL, NULL, NULL, NULL, '2025-11-12', NULL, NULL, '2025-11-15', NULL, NULL, '2025-11-18', 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD60', 'Pago a 60 días', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('WDDXYZ9876512AUTO2', 'LOTE-AUTO-03', NULL, 'OC-00221', NULL, NULL, 'Autos', NULL, 'GLA 200', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Maria Lopez', NULL, NULL, NULL, '2025-10-03', NULL, '2025-10-16', NULL, NULL, NULL, '2025-11-03', NULL, '2025-11-06', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-19', '2025-10-25', NULL, NULL, NULL, NULL, NULL, '2025-10-30', '2025-11-11', '2025-11-01', '2025-11-02', NULL, NULL, '2025-11-07', NULL, NULL, NULL, NULL, '2025-11-13', NULL, NULL, '2025-11-16', NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD60', 'Pago a 60 días', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('RAM1C6RR7LT3MN9876', 'LOTE-AUTO-04', NULL, 'OC-00222', NULL, NULL, 'Autos', NULL, '1500 Laramie', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Maria Lopez', NULL, NULL, NULL, '2025-10-04', NULL, '2025-10-17', NULL, NULL, NULL, NULL, NULL, '2025-10-20', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-21', '2025-10-28', NULL, NULL, NULL, NULL, NULL, '2025-10-31', NULL, '2025-11-01', '2025-11-02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD60', 'Pago a 60 días', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('CATEXC330GC2025MAQ1', 'LOTE-MAQ-01', NULL, 'OC-00230', NULL, NULL, 'Maquinarias', NULL, 'Excavadora 330 GC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Carlos Ruiz', NULL, NULL, NULL, '2025-12-13', NULL, '2025-12-28', NULL, NULL, NULL, '2026-01-08', NULL, '2026-01-03', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-04', '2026-01-10', NULL, NULL, NULL, NULL, NULL, '2026-01-12', '2026-01-25', '2026-01-13', '2026-01-14', NULL, NULL, '2026-02-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD10', 'Leasing', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.staging_vin VALUES ('WDBBUSLNEA001BUS01', 'LOTE-BUS-02', NULL, 'OC-00240', NULL, NULL, 'Buses', NULL, 'O 500 RSD 2442', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ana Torres', NULL, NULL, NULL, '2025-11-16', NULL, '2025-11-30', NULL, NULL, NULL, '2025-12-26', NULL, '2025-12-30', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04', '2025-12-10', NULL, NULL, NULL, NULL, NULL, '2025-12-14', '2026-01-02', '2025-12-16', '2025-12-17', NULL, NULL, '2025-12-31', NULL, NULL, NULL, NULL, '2026-01-03', NULL, NULL, '2026-01-05', NULL, NULL, '2026-01-08', 'SEED', NULL, NULL, NULL, NULL, NULL, 'ZD20', 'Financiamiento BK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: subetapa; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subetapa VALUES (1, 1, 'Solicitud negocio', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_colocacion', NULL);
INSERT INTO public.subetapa VALUES (2, 1, 'Pedido fábrica', 2, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_colocacion', NULL);
INSERT INTO public.subetapa VALUES (3, 1, 'Producción', 3, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_liberacion_fabrica', NULL);
INSERT INTO public.subetapa VALUES (4, 1, 'Carrocero Internacional', 4, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_fin_prod_carr_real', NULL);
INSERT INTO public.subetapa VALUES (5, 1, 'Embarque', 5, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_embarque_sap', NULL);
INSERT INTO public.subetapa VALUES (6, 1, 'En aduana', 6, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_llegada_aduana', NULL);
INSERT INTO public.subetapa VALUES (7, 1, 'En almacén', 7, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_ingreso_patio', NULL);
INSERT INTO public.subetapa VALUES (8, 2, 'Reserva', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_preasignacion', NULL);
INSERT INTO public.subetapa VALUES (9, 2, 'Asig. Definitiva', 2, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_asignacion', NULL);
INSERT INTO public.subetapa VALUES (10, 3, 'Inicio PDI', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_ingreso_prod_carr_real', NULL);
INSERT INTO public.subetapa VALUES (11, 3, 'En Carrocero Local', 2, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_fin_prod_carr_real', NULL);
INSERT INTO public.subetapa VALUES (12, 3, 'Salida PDI', 3, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_liberado_sap', NULL);
INSERT INTO public.subetapa VALUES (13, 4, 'Solicitud crédito', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', NULL, NULL);
INSERT INTO public.subetapa VALUES (14, 4, 'Aprobación', 2, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', NULL, NULL);
INSERT INTO public.subetapa VALUES (15, 5, 'Emisión Factura', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fecha_facturacion_sap', NULL);
INSERT INTO public.subetapa VALUES (16, 6, 'Pago Confirmado', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', NULL, NULL);
INSERT INTO public.subetapa VALUES (17, 7, 'Inicio trámite', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fcc', NULL);
INSERT INTO public.subetapa VALUES (18, 7, 'Placas recibidas', 2, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', 'fclr', NULL);
INSERT INTO public.subetapa VALUES (19, 8, 'Unidad Lista', 1, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', NULL, NULL);
INSERT INTO public.subetapa VALUES (20, 8, 'Cita Agendada', 2, true, '2026-03-11 14:55:30.839151', '2026-03-11 14:55:30.839151', NULL, NULL);
INSERT INTO public.subetapa VALUES (21, 9, 'Entregado al Cliente', 1, true, NULL, NULL, 'fecha_entrega_cliente', NULL);


--
-- Data for Name: subetapa_tipo_vehiculo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subetapa_tipo_vehiculo VALUES (107, 1, 1, true, '2026-03-13 09:47:49.285795', '2026-03-13 09:47:49.285795', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (108, 2, 2, true, '2026-03-13 09:47:49.291976', '2026-03-13 09:47:49.291976', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (143, 16, 1, false, '2026-03-13 09:47:54.181759', '2026-03-13 15:36:49.953169', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (142, 15, 1, false, '2026-03-13 09:47:54.171762', '2026-03-13 15:36:50.328248', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (148, 21, 1, false, '2026-03-13 09:47:54.227753', '2026-03-13 15:36:57.070092', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (141, 14, 2, false, '2026-03-13 09:47:54.159815', '2026-03-13 15:36:58.118851', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (140, 13, 1, false, '2026-03-13 09:47:54.154627', '2026-03-13 15:36:58.119663', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (114, 8, 1, true, '2026-03-13 09:47:49.33345', '2026-03-13 09:47:49.33345', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (115, 9, 2, true, '2026-03-13 09:47:49.33855', '2026-03-13 09:47:49.33855', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (136, 9, 2, true, '2026-03-13 09:47:54.121122', '2026-03-13 15:37:00.903464', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (135, 8, 1, true, '2026-03-13 09:47:54.11385', '2026-03-13 15:37:00.905504', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (131, 4, 4, false, '2026-03-13 09:47:54.086241', '2026-03-13 15:37:09.35775', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (132, 5, 5, false, '2026-03-13 09:47:54.091822', '2026-03-13 15:37:09.705693', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (133, 6, 6, false, '2026-03-13 09:47:54.096614', '2026-03-13 15:37:10.063132', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (123, 17, 1, true, '2026-03-13 09:47:49.407934', '2026-03-13 09:47:49.407934', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (124, 18, 2, true, '2026-03-13 09:47:49.413656', '2026-03-13 09:47:49.413656', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (134, 7, 7, false, '2026-03-13 09:47:54.102916', '2026-03-13 15:37:10.401236', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (127, 21, 1, false, '2026-03-13 09:47:49.443393', '2026-03-13 16:20:37.795578', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (128, 1, 1, true, '2026-03-13 09:47:54.069423', '2026-03-13 09:47:54.069423', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (129, 2, 2, true, '2026-03-13 09:47:54.074827', '2026-03-13 09:47:54.074827', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (130, 3, 3, true, '2026-03-13 09:47:54.079782', '2026-03-13 09:47:54.079782', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (137, 10, 1, true, '2026-03-13 09:47:54.132904', '2026-03-13 09:47:54.132904', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (138, 11, 2, true, '2026-03-13 09:47:54.139131', '2026-03-13 09:47:54.139131', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (139, 12, 3, true, '2026-03-13 09:47:54.143514', '2026-03-13 09:47:54.143514', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (146, 19, 1, true, '2026-03-13 09:47:54.211113', '2026-03-13 09:47:54.211113', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (147, 20, 2, true, '2026-03-13 09:47:54.217169', '2026-03-13 09:47:54.217169', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (149, 1, 1, true, '2026-03-13 15:11:17.036402', '2026-03-13 15:11:17.036402', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (150, 2, 2, true, '2026-03-13 15:11:17.046348', '2026-03-13 15:11:17.046348', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (151, 3, 3, true, '2026-03-13 15:11:17.055336', '2026-03-13 15:11:17.055336', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (152, 4, 4, true, '2026-03-13 15:11:17.062751', '2026-03-13 15:11:17.062751', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (153, 5, 5, true, '2026-03-13 15:11:17.071475', '2026-03-13 15:11:17.071475', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (154, 6, 6, true, '2026-03-13 15:11:17.078801', '2026-03-13 15:11:17.078801', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (155, 7, 7, true, '2026-03-13 15:11:17.088093', '2026-03-13 15:11:17.088093', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (156, 8, 1, true, '2026-03-13 15:11:17.104087', '2026-03-13 15:11:17.104087', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (157, 9, 2, true, '2026-03-13 15:11:17.111179', '2026-03-13 15:11:17.111179', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (158, 10, 1, true, '2026-03-13 15:11:17.126656', '2026-03-13 15:11:17.126656', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (159, 11, 2, true, '2026-03-13 15:11:17.134201', '2026-03-13 15:11:17.134201', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (160, 12, 3, true, '2026-03-13 15:11:17.140922', '2026-03-13 15:11:17.140922', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (161, 13, 1, true, '2026-03-13 15:11:17.156115', '2026-03-13 15:11:17.156115', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (162, 14, 2, true, '2026-03-13 15:11:17.163251', '2026-03-13 15:11:17.163251', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (163, 15, 1, true, '2026-03-13 15:11:17.178534', '2026-03-13 15:11:17.178534', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (164, 16, 1, true, '2026-03-13 15:11:17.192284', '2026-03-13 15:11:17.192284', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (165, 17, 1, true, '2026-03-13 15:11:17.205249', '2026-03-13 15:11:17.205249', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (166, 18, 2, true, '2026-03-13 15:11:17.210847', '2026-03-13 15:11:17.210847', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (167, 19, 1, true, '2026-03-13 15:11:17.223515', '2026-03-13 15:11:17.223515', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (168, 20, 2, true, '2026-03-13 15:11:17.228707', '2026-03-13 15:11:17.228707', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (169, 21, 1, true, '2026-03-13 15:11:17.240474', '2026-03-13 15:11:17.240474', 3);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (170, 1, 1, true, '2026-03-13 15:13:48.471559', '2026-03-13 15:13:48.471559', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (171, 2, 2, true, '2026-03-13 15:13:48.478745', '2026-03-13 15:13:48.478745', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (172, 3, 3, true, '2026-03-13 15:13:48.485698', '2026-03-13 15:13:48.485698', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (173, 4, 4, true, '2026-03-13 15:13:48.492668', '2026-03-13 15:13:48.492668', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (174, 5, 5, true, '2026-03-13 15:13:48.500045', '2026-03-13 15:13:48.500045', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (175, 6, 6, true, '2026-03-13 15:13:48.506187', '2026-03-13 15:13:48.506187', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (176, 7, 7, true, '2026-03-13 15:13:48.515278', '2026-03-13 15:13:48.515278', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (177, 8, 1, true, '2026-03-13 15:13:48.529086', '2026-03-13 15:13:48.529086', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (178, 9, 2, true, '2026-03-13 15:13:48.537354', '2026-03-13 15:13:48.537354', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (179, 10, 1, true, '2026-03-13 15:13:48.551071', '2026-03-13 15:13:48.551071', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (180, 11, 2, true, '2026-03-13 15:13:48.557112', '2026-03-13 15:13:48.557112', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (181, 12, 3, true, '2026-03-13 15:13:48.566235', '2026-03-13 15:13:48.566235', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (182, 13, 1, true, '2026-03-13 15:13:48.585226', '2026-03-13 15:13:48.585226', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (183, 14, 2, true, '2026-03-13 15:13:48.594569', '2026-03-13 15:13:48.594569', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (184, 15, 1, true, '2026-03-13 15:13:48.611622', '2026-03-13 15:13:48.611622', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (185, 16, 1, true, '2026-03-13 15:13:48.627204', '2026-03-13 15:13:48.627204', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (186, 17, 1, true, '2026-03-13 15:13:48.641072', '2026-03-13 15:13:48.641072', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (187, 18, 2, true, '2026-03-13 15:13:48.648176', '2026-03-13 15:13:48.648176', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (188, 19, 1, true, '2026-03-13 15:13:48.661353', '2026-03-13 15:13:48.661353', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (189, 20, 2, true, '2026-03-13 15:13:48.668459', '2026-03-13 15:13:48.668459', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (190, 21, 1, true, '2026-03-13 15:13:48.681979', '2026-03-13 15:13:48.681979', 4);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (125, 19, 1, false, '2026-03-13 09:47:49.423641', '2026-03-13 15:22:08.000214', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (126, 20, 2, false, '2026-03-13 09:47:49.428289', '2026-03-13 15:22:08.001212', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (122, 16, 1, false, '2026-03-13 09:47:49.398007', '2026-03-13 15:22:15.196861', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (121, 15, 1, false, '2026-03-13 09:47:49.388471', '2026-03-13 15:22:15.897909', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (120, 14, 2, false, '2026-03-13 09:47:49.377796', '2026-03-13 15:22:16.433637', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (119, 13, 1, false, '2026-03-13 09:47:49.372969', '2026-03-13 15:22:16.435179', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (118, 12, 3, false, '2026-03-13 09:47:49.360835', '2026-03-13 15:22:17.48114', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (117, 11, 2, false, '2026-03-13 09:47:49.35615', '2026-03-13 15:22:17.481853', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (116, 10, 1, false, '2026-03-13 09:47:49.351034', '2026-03-13 15:22:17.484564', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (110, 4, 4, false, '2026-03-13 09:47:49.305029', '2026-03-13 15:22:24.371876', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (109, 3, 3, false, '2026-03-13 09:47:49.298099', '2026-03-13 15:22:24.762693', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (111, 5, 5, false, '2026-03-13 09:47:49.31114', '2026-03-13 15:22:25.719506', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (112, 6, 6, false, '2026-03-13 09:47:49.317143', '2026-03-13 15:22:26.093468', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (113, 7, 7, false, '2026-03-13 09:47:49.322462', '2026-03-13 15:22:26.479097', 1);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (145, 18, 2, false, '2026-03-13 09:47:54.197956', '2026-03-13 15:36:49.068508', 2);
INSERT INTO public.subetapa_tipo_vehiculo VALUES (144, 17, 1, false, '2026-03-13 09:47:54.193011', '2026-03-13 15:36:49.067408', 2);


--
-- Data for Name: tipo_vehiculo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tipo_vehiculo VALUES (1, 'Camión', 'camion', '#2E75B6', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417');
INSERT INTO public.tipo_vehiculo VALUES (2, 'Bus', 'bus', '#7C3AED', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417');
INSERT INTO public.tipo_vehiculo VALUES (3, 'Maquinaria', 'maquinaria', '#EA580C', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417');
INSERT INTO public.tipo_vehiculo VALUES (4, 'Vehículo Ligero', 'vehiculo_ligero', '#0EA5E9', true, '2026-03-13 14:34:39.371417', '2026-03-13 14:34:39.371417');


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
-- Data for Name: vin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.vin VALUES ('WDB9988776655AABC1', 1, 'Mercedes-Benz', '2025-12-15 10:30:00', NULL, NULL, 1);
INSERT INTO public.vin VALUES ('WDB9988776655AABC2', 1, 'Mercedes-Benz', '2026-01-20 14:00:00', NULL, NULL, 1);
INSERT INTO public.vin VALUES ('WDBBUS44556601BUS1', 2, 'Mercedes-Benz', '2026-01-28 09:00:00', NULL, NULL, 2);
INSERT INTO public.vin VALUES ('WDBBUS44556602BUS2', 2, 'Mercedes-Benz', '2026-01-10 16:00:00', NULL, NULL, 2);
INSERT INTO public.vin VALUES ('JEEP1C4HJXEG8MW123', 3, 'Jeep', '2026-01-05 11:00:00', NULL, NULL, 4);
INSERT INTO public.vin VALUES ('WDDXYZ9876512AUTO2', 3, 'Mercedes-Benz', '2026-02-10 08:30:00', NULL, NULL, 4);
INSERT INTO public.vin VALUES ('RAM1C6RR7LT3MN9876', 3, 'RAM', '2026-01-15 10:00:00', NULL, NULL, 4);
INSERT INTO public.vin VALUES ('CATEXC330GC2025MAQ1', 4, 'CAT', '2026-01-20 15:00:00', NULL, NULL, 3);
INSERT INTO public.vin VALUES ('WDBBUSLNEA001BUS01', 5, 'Mercedes-Benz', '2026-02-28 12:00:00', NULL, NULL, 2);


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
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cliente_id_seq', 5, true);


--
-- Name: empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empresa_id_seq', 3, true);


--
-- Name: ficha_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ficha_id_seq', 5, true);


--
-- Name: fuentes_vin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fuentes_vin_id_seq', 3, true);


--
-- Name: grupo_paralelo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grupo_paralelo_id_seq', 10, true);


--
-- Name: hito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hito_id_seq', 9, true);


--
-- Name: hito_tipo_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hito_tipo_vehiculo_id_seq', 82, true);


--
-- Name: mapeo_campos_vin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mapeo_campos_vin_id_seq', 84, true);


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

SELECT pg_catalog.setval('public.sla_config_id_seq', 8, true);


--
-- Name: subetapa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subetapa_id_seq', 21, true);


--
-- Name: subetapa_tipo_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subetapa_tipo_vehiculo_id_seq', 190, true);


--
-- Name: tipo_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_vehiculo_id_seq', 4, true);


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
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id);


--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id);


--
-- Name: ficha ficha_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ficha
    ADD CONSTRAINT ficha_pkey PRIMARY KEY (id);


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
-- Name: tipo_vehiculo tipo_vehiculo_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_vehiculo
    ADD CONSTRAINT tipo_vehiculo_slug_key UNIQUE (slug);


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
-- Name: vin vin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin
    ADD CONSTRAINT vin_pkey PRIMARY KEY (id);


--
-- Name: idx_alerta_nivel_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerta_nivel_estado ON public.alerta USING btree (nivel, estado_alerta);


--
-- Name: idx_alerta_vin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerta_vin_id ON public.alerta USING btree (vin_id);


--
-- Name: idx_cliente_empresa_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_empresa_id ON public.cliente USING btree (empresa_id);


--
-- Name: idx_ficha_cliente_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ficha_cliente_id ON public.ficha USING btree (cliente_id);


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
-- Name: idx_vin_ficha_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vin_ficha_id ON public.vin USING btree (ficha_id);


--
-- Name: idx_vin_tipo_vehiculo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vin_tipo_vehiculo_id ON public.vin USING btree (tipo_vehiculo_id);


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
-- Name: alerta alerta_vin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_vin_id_fkey FOREIGN KEY (vin_id) REFERENCES public.vin(id);


--
-- Name: chat chat_ficha_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_ficha_id_fkey FOREIGN KEY (ficha_id) REFERENCES public.ficha(id);


--
-- Name: chat chat_vin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_vin_id_fkey FOREIGN KEY (vin_id) REFERENCES public.vin(id);


--
-- Name: cliente cliente_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(id);


--
-- Name: ficha ficha_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ficha
    ADD CONSTRAINT ficha_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


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
-- Name: vin fk_vin_staging; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin
    ADD CONSTRAINT fk_vin_staging FOREIGN KEY (id) REFERENCES public.staging_vin(vin);


--
-- Name: vin fk_vin_tipo_vehiculo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin
    ADD CONSTRAINT fk_vin_tipo_vehiculo FOREIGN KEY (tipo_vehiculo_id) REFERENCES public.tipo_vehiculo(id);


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
-- Name: vin vin_ficha_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin
    ADD CONSTRAINT vin_ficha_id_fkey FOREIGN KEY (ficha_id) REFERENCES public.ficha(id);


--
-- PostgreSQL database dump complete
--

\unrestrict lrJeMf8wTLcb6rhGlt83XD4FIRnLPr5l0Kd5ad6JuKTN3GOSAsmJ1KVaVFpFf7s

