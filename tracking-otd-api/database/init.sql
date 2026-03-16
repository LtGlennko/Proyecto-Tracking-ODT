-- =========================
-- EMPRESA / CLIENTES
-- =========================

CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    codigo VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresa(id),
    nombre VARCHAR(255),
    ruc VARCHAR(50),
    is_vic BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE ficha (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES cliente(id),
    codigo VARCHAR(100),
    forma_pago VARCHAR(100),
    fecha_creacion DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE vin (
    id VARCHAR(50) PRIMARY KEY,
    ficha_id INT REFERENCES ficha(id),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    segmento VARCHAR(100),
    linea_negocio VARCHAR(100),
    tipo_vehiculo VARCHAR(100),
    lote VARCHAR(100),
    ejecutivo_sap VARCHAR(100),
    tipo_financiamiento VARCHAR(100),
    eta_entrega_final DATE,
    desviacion_acumulada INT,
    ultima_actualizacion TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- =========================
-- USUARIOS
-- =========================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    azure_ad_oid VARCHAR(255),
    nombre VARCHAR(255),
    email VARCHAR(255),
    perfil VARCHAR(100),
    activo BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE usuario_empresa (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuario(id),
    empresa_id INT REFERENCES empresa(id)
);

-- =========================
-- HITOS
-- =========================

CREATE TABLE grupo_paralelo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    orden_global INT,
    descripcion TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE hito (
    id SERIAL PRIMARY KEY,
    grupo_paralelo_id INT REFERENCES grupo_paralelo(id),
    usuario_responsable_id INT REFERENCES usuario(id),
    nombre VARCHAR(255),
    carril VARCHAR(100),
    orden INT,
    tipo_vehiculo VARCHAR(100),
    activo BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE subetapa (
    id SERIAL PRIMARY KEY,
    hito_id INT REFERENCES hito(id),
    nombre VARCHAR(255),
    orden INT,
    activo_default BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE subetapa_config (
    id SERIAL PRIMARY KEY,
    subetapa_id INT REFERENCES subetapa(id),
    marca VARCHAR(100),
    segmento VARCHAR(100),
    tipo_vehiculo VARCHAR(100),
    activo BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- =========================
-- TRACKING
-- =========================

CREATE TABLE vin_hito_tracking (
    id SERIAL PRIMARY KEY,
    vin_id VARCHAR(50) REFERENCES vin(id),
    hito_id INT REFERENCES hito(id),
    fecha_plan DATE,
    fecha_real DATE,
    diferencia_dias INT,
    estado VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE vin_subetapa_tracking (
    id SERIAL PRIMARY KEY,
    vin_id VARCHAR(50) REFERENCES vin(id),
    subetapa_id INT REFERENCES subetapa(id),
    fecha_plan DATE,
    fecha_real DATE,
    diferencia_dias INT,
    estado VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- =========================
-- SLA
-- =========================

CREATE TABLE sla_config (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresa(id),
    subetapa_id INT REFERENCES subetapa(id),
    linea_negocio VARCHAR(100),
    tipo_vehiculo VARCHAR(100),
    dias_objetivo INT,
    dias_tolerancia INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- =========================
-- ALERTAS
-- =========================

CREATE TABLE alerta (
    id SERIAL PRIMARY KEY,
    vin_id VARCHAR(50) REFERENCES vin(id),
    hito_id INT REFERENCES hito(id),
    usuario_responsable_id INT REFERENCES usuario(id),
    nivel VARCHAR(50),
    dias_demora INT,
    estado_alerta VARCHAR(50),
    fecha_generacion TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE alerta_accion (
    id SERIAL PRIMARY KEY,
    alerta_id INT REFERENCES alerta(id),
    usuario_accion_id INT REFERENCES usuario(id),
    accion_tomada VARCHAR(255),
    fecha_accion TIMESTAMP,
    notas TEXT
);

-- =========================
-- CHAT
-- =========================

CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    ficha_id INT REFERENCES ficha(id),
    vin_id VARCHAR(50) REFERENCES vin(id),
    created_at TIMESTAMP
);

CREATE TABLE mensaje (
    id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chat(id),
    usuario_autor_id INT REFERENCES usuario(id),
    contenido TEXT,
    fecha_hora TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE mensaje_etiqueta (
    id SERIAL PRIMARY KEY,
    mensaje_id INT REFERENCES mensaje(id),
    usuario_etiquetado_id INT REFERENCES usuario(id)
);

CREATE TABLE notificacion (
    id SERIAL PRIMARY KEY,
    usuario_destino_id INT REFERENCES usuario(id),
    mensaje_id INT REFERENCES mensaje(id),
    canal VARCHAR(50),
    url_redireccion VARCHAR(500),
    fecha_envio TIMESTAMP,
    estado_envio VARCHAR(50)
);

-- =========================
-- STAGING
-- =========================

CREATE TABLE staging_vin (
    vin VARCHAR(50) PRIMARY KEY,
    lote_asignado VARCHAR(100),
    id_ficha_sap VARCHAR(100),
    pedido_interno VARCHAR(100),
    pedido_externo VARCHAR(100),
    pedido_venta_sap VARCHAR(100),
    linea_negocio VARCHAR(100),
    clase VARCHAR(100),
    modelo_comercial VARCHAR(255),
    modelo_facturacion VARCHAR(255),
    sku VARCHAR(100),
    matricula VARCHAR(100),
    cod_cliente_sap VARCHAR(100),
    nombre_cliente_sap VARCHAR(255),
    cliente_comex VARCHAR(255),
    cod_vendedor VARCHAR(100),
    nombre_vendedor VARCHAR(255),
    estado_comex VARCHAR(100),
    estado_ficha_sap VARCHAR(100),
    status_compra_sap VARCHAR(100),
    fecha_colocacion DATE,
    mes_prod_confirmado VARCHAR(50),
    fecha_liberacion_fabrica DATE,
    carrocero VARCHAR(100),
    fecha_recojo_carr_zcar DATE,
    fecha_ingreso_prod_carr_planif DATE,
    fecha_ingreso_prod_carr_real DATE,
    fecha_lib_prod_carr_planif DATE,
    fecha_fin_prod_carr_real DATE,
    dias_prod_carr_planif INT,
    dias_prod_carr_real INT,
    modalidad_embarque VARCHAR(100),
    transportista VARCHAR(100),
    remonta VARCHAR(100),
    etd DATE,
    fecha_embarque_sap DATE,
    fecha_llegada_aduana DATE,
    fecha_llegada_sap DATE,
    eta DATE,
    fecha_aduana_sap DATE,
    fecha_nacion DATE,
    num_declaracion VARCHAR(100),
    fecha_ingreso_patio DATE,
    fecha_liberado_sap DATE,
    fecha_preasignacion DATE,
    fecha_asignacion DATE,
    num_factura_sap VARCHAR(100),
    num_factura_comex VARCHAR(100),
    fecha_facturacion_sap DATE,
    fecha_factura_comex DATE,
    precio_confirmado DECIMAL(15,2),
    precio_venta_pv DECIMAL(15,2),
    precio_lista DECIMAL(15,2),
    fcc DATE,
    fcr DATE,
    fcl DATE,
    fclr DATE,
    fecha_entrega_planificada DATE,
    fecha_entrega_real DATE,
    fecha_entrega_cliente DATE,
    fuente_ultima_sync VARCHAR(100),
    fecha_sync_sap TIMESTAMP,
    fecha_sync_comex TIMESTAMP,
    observaciones_comex TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

ALTER TABLE vin
ADD CONSTRAINT fk_vin_staging
FOREIGN KEY (id) REFERENCES staging_vin(vin);

-- =========================
-- MEJORAS v1.2
-- Aplicadas sobre el script original sin modificarlo
-- =========================

-- ── CONSTRAINTS DE NEGOCIO ──────────────────────────────────

ALTER TABLE sla_config
  ADD CONSTRAINT chk_sla_min_dimension
  CHECK (empresa_id IS NOT NULL OR subetapa_id IS NOT NULL
         OR linea_negocio IS NOT NULL OR tipo_vehiculo IS NOT NULL);

ALTER TABLE chat
  ADD CONSTRAINT chk_chat_xor
  CHECK ((ficha_id IS NULL) <> (vin_id IS NULL));

-- ── UNIQUE CONSTRAINTS ──────────────────────────────────────
ALTER TABLE usuario ADD CONSTRAINT uq_usuario_email  UNIQUE (email);
ALTER TABLE usuario ADD CONSTRAINT uq_usuario_oid    UNIQUE (azure_ad_oid);
ALTER TABLE empresa ADD CONSTRAINT uq_empresa_codigo UNIQUE (codigo);
ALTER TABLE vin_hito_tracking     ADD CONSTRAINT uq_vin_hito    UNIQUE (vin_id, hito_id);
ALTER TABLE vin_subetapa_tracking ADD CONSTRAINT uq_vin_subetapa UNIQUE (vin_id, subetapa_id);
ALTER TABLE usuario_empresa       ADD CONSTRAINT uq_usuario_empresa UNIQUE (usuario_id, empresa_id);

-- ── ÍNDICES DE PERFORMANCE ──────────────────────────────────
CREATE INDEX idx_vin_ficha_id           ON vin(ficha_id);
CREATE INDEX idx_vin_tipo_vehiculo      ON vin(tipo_vehiculo);
CREATE INDEX idx_vin_linea_negocio      ON vin(linea_negocio);
CREATE INDEX idx_cliente_empresa_id     ON cliente(empresa_id);
CREATE INDEX idx_ficha_cliente_id       ON ficha(cliente_id);
CREATE INDEX idx_vht_vin_id             ON vin_hito_tracking(vin_id);
CREATE INDEX idx_vht_hito_id            ON vin_hito_tracking(hito_id);
CREATE INDEX idx_vht_estado             ON vin_hito_tracking(estado);
CREATE INDEX idx_vst_vin_id             ON vin_subetapa_tracking(vin_id);
CREATE INDEX idx_vst_subetapa_id        ON vin_subetapa_tracking(subetapa_id);
CREATE INDEX idx_vst_estado             ON vin_subetapa_tracking(estado);
CREATE INDEX idx_alerta_vin_id          ON alerta(vin_id);
CREATE INDEX idx_alerta_nivel_estado    ON alerta(nivel, estado_alerta);
CREATE INDEX idx_sla_subetapa_empresa   ON sla_config(subetapa_id, empresa_id);
CREATE INDEX idx_mensaje_chat_id        ON mensaje(chat_id);
CREATE INDEX idx_staging_pedido_externo ON staging_vin(pedido_externo);
CREATE INDEX idx_staging_fuente_sync    ON staging_vin(fuente_ultima_sync);

-- ── DATOS SEMILLA ────────────────────────────────────────────

INSERT INTO empresa (nombre, codigo, created_at, updated_at) VALUES
  ('Divemotor',   'DIV', NOW(), NOW()),
  ('Andes Motor', 'AND', NOW(), NOW()),
  ('Andes Maq',   'MAQ', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO grupo_paralelo (nombre, orden_global, descripcion, created_at, updated_at) VALUES
  ('Bloque Principal Financiero + PDI', 1,
   'Importación (financiero) y PDI (operativo) corren en paralelo', NOW(), NOW()),
  ('Post-Almacén', 2,
   'Secuencia financiera post-ingreso a almacén', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO hito (nombre, carril, orden, grupo_paralelo_id, tipo_vehiculo, activo, created_at, updated_at)
SELECT s.nombre, s.carril, s.orden, gp.id, s.tipo_vehiculo, TRUE, NOW(), NOW()
FROM (VALUES
  ('Importación',     'financiero', 1, 'Bloque Principal Financiero + PDI', NULL::VARCHAR),
  ('PDI (Carrozado)', 'operativo',  1, 'Bloque Principal Financiero + PDI', 'Bus'),
  ('Asignación',      'financiero', 1, 'Post-Almacén', NULL),
  ('Crédito',         'financiero', 2, 'Post-Almacén', NULL),
  ('Facturación',     'financiero', 3, 'Post-Almacén', NULL),
  ('Pago',            'financiero', 4, 'Post-Almacén', NULL),
  ('Inmatriculación', 'financiero', 5, 'Post-Almacén', NULL),
  ('Programación',    'financiero', 6, 'Post-Almacén', NULL),
  ('Entrega',         'financiero', 7, 'Post-Almacén', NULL)
) AS s(nombre, carril, orden, grupo_nombre, tipo_vehiculo)
JOIN grupo_paralelo gp ON gp.nombre = s.grupo_nombre
ON CONFLICT DO NOTHING;

INSERT INTO subetapa (hito_id, nombre, orden, activo_default, created_at, updated_at)
SELECT h.id, s.nombre, s.orden, s.activo_default, NOW(), NOW()
FROM (VALUES
  ('Importación',     'Solicitud negocio',   1, TRUE),
  ('Importación',     'Pedido fábrica',       2, TRUE),
  ('Importación',     'Producción',           3, TRUE),
  ('Importación',     'Embarque',             4, TRUE),
  ('Importación',     'En aduana',            5, TRUE),
  ('Importación',     'En almacén',           6, TRUE),
  ('PDI (Carrozado)', 'Inicio PDI',           1, FALSE),
  ('PDI (Carrozado)', 'En Carrocero Local',   2, FALSE),
  ('PDI (Carrozado)', 'Salida PDI',           3, FALSE),
  ('Asignación',      'Reserva',              1, TRUE),
  ('Asignación',      'Asig. Definitiva',     2, TRUE),
  ('Crédito',         'Solicitud crédito',    1, TRUE),
  ('Crédito',         'Aprobación',           2, TRUE),
  ('Facturación',     'Emisión Factura',      1, TRUE),
  ('Pago',            'Pago Confirmado',      1, TRUE),
  ('Inmatriculación', 'Inicio Trámite',       1, TRUE),
  ('Inmatriculación', 'Placas Recibidas',     2, TRUE),
  ('Programación',    'Unidad Lista',         1, TRUE),
  ('Programación',    'Cita Agendada',        2, TRUE),
  ('Entrega',         'Entregado al Cliente', 1, TRUE)
) AS s(hito_nombre, nombre, orden, activo_default)
JOIN hito h ON h.nombre = s.hito_nombre
ON CONFLICT DO NOTHING;

-- ── VERIFICACIÓN FINAL ───────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos tracking_otd inicializada correctamente';
  RAISE NOTICE '   Empresas: %',       (SELECT COUNT(*) FROM empresa);
  RAISE NOTICE '   Grupos paralelos: %', (SELECT COUNT(*) FROM grupo_paralelo);
  RAISE NOTICE '   Hitos: %',          (SELECT COUNT(*) FROM hito);
  RAISE NOTICE '   Subetapas: %',      (SELECT COUNT(*) FROM subetapa);
END $$;
