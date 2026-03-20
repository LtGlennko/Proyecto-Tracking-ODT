-- ============================================================
-- SEED MAESTRO: hito + subetapa
-- Fuente: Fuente_Hitos.xlsx (col A = Hito, col B = Subetapa)
-- Sin campos de fecha asignados (campo_staging_real / plan = NULL)
-- ============================================================

BEGIN;

-- Limpiar dependencias antes de truncar
TRUNCATE TABLE subetapa_tipo_vehiculo CASCADE;
TRUNCATE TABLE hito_tipo_vehiculo     CASCADE;
TRUNCATE TABLE sla_config             CASCADE;
TRUNCATE TABLE subetapa               CASCADE;
TRUNCATE TABLE hito                   CASCADE;

-- Reiniciar secuencias
ALTER SEQUENCE hito_id_seq    RESTART WITH 1;
ALTER SEQUENCE subetapa_id_seq RESTART WITH 1;

-- ──────────────────────────────────────────
-- HITOS
-- ──────────────────────────────────────────
INSERT INTO hito (nombre, orden) VALUES
  ('Importación',      1),
  ('PDI (Carrozado)',  2),
  ('Asignación',       3),
  ('Crédito',          4),
  ('Facturación',      5),
  ('Pago',             6),
  ('Inmatriculación',  7),
  ('Programación',     8),
  ('Entrega',          9);

-- ──────────────────────────────────────────
-- SUBETAPAS  (campo_staging_real/plan = NULL)
-- ──────────────────────────────────────────

-- Importación (orden 1)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Solicitud negocio',    1, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Pedido fábrica',       2, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Confirmación fábrica', 3, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Liberación de pedido', 4, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Salida de fábrica',    5, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Embarque',             6, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'Llegada',              7, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Importación'), 'En almacén',           8, NULL, NULL);

-- PDI (Carrozado) (orden 2)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'PDI (Carrozado)'), 'Llegada Carrocero', 1, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'PDI (Carrozado)'), 'Inicio PDI',        2, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'PDI (Carrozado)'), 'Salida PDI',        3, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'PDI (Carrozado)'), 'Salida Carrocero',  4, NULL, NULL);

-- Asignación (orden 3)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Asignación'), 'Pre-Asignación',   1, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Asignación'), 'Asig. Definitiva', 2, NULL, NULL);

-- Crédito (orden 4)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Crédito'), 'Solicitud crédito', 1, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Crédito'), 'Aprobación',        2, NULL, NULL);

-- Facturación (orden 5)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Facturación'), 'Emisión factura', 1, NULL, NULL);

-- Pago (orden 6)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Pago'), 'Pago confirmado', 1, NULL, NULL);

-- Inmatriculación (orden 7)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Emisión de documentos',         1,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Recepción de documentos',       2,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Recep. doc Carrocería',         3,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Entrega exp. a tramitador',     4,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Observado por AAP',             5,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Calificación SUNARP',           6,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Observado SUNARP',              7,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Reingresado',                   8,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Inscrito',                      9,  NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Inmatriculación'), 'Recepción de Placas de Rodaje', 10, NULL, NULL);

-- Programación (orden 8)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Programación'), 'Unidad Lista',   1, NULL, NULL),
  ((SELECT id FROM hito WHERE nombre = 'Programación'), 'Fecha agendada', 2, NULL, NULL);

-- Entrega (orden 9)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  ((SELECT id FROM hito WHERE nombre = 'Entrega'), 'Entregado al Cliente', 1, NULL, NULL);

COMMIT;

-- ──────────────────────────────────────────
-- VERIFICACIÓN
-- ──────────────────────────────────────────
-- SELECT h.nombre AS hito, s.nombre AS subetapa, s.orden
-- FROM subetapa s
-- JOIN hito h ON h.id = s.hito_id
-- ORDER BY h.orden, s.orden;
