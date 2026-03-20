-- ============================================================
-- Script: Actualización maestro de hitos y subetapas
-- Fuente: Fuente_Hitos.xlsx (columnas A y B)
-- Criterio: Solo estructura maestro, sin campo_staging_real
--           ni campo_staging_plan (campos fecha = NULL, limpio)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Limpiar tablas dependientes de subetapa
--    (sla_config y subetapa_tipo_vehiculo referencian subetapa)
-- ------------------------------------------------------------
DELETE FROM sla_config WHERE subetapa_id IS NOT NULL;
DELETE FROM subetapa_tipo_vehiculo;
DELETE FROM subetapa;

-- Reiniciar secuencia de subetapas
ALTER SEQUENCE subetapa_id_seq RESTART WITH 1;

-- ------------------------------------------------------------
-- 2. Actualizar hitos existentes
--    - Mantener IDs actuales para no romper hito_tipo_vehiculo
--    - Cambiar nombre PDI → PDI (Carrozado)
--    - Corregir orden: PDI=2, Asignación=3
-- ------------------------------------------------------------
UPDATE hito SET nombre = 'PDI (Carrozado)', orden = 2  WHERE id = 3;
UPDATE hito SET orden  = 3                             WHERE id = 2; -- Asignación

-- Confirmar órdenes finales (sin cambio si ya son correctos)
UPDATE hito SET orden = 1 WHERE id = 1; -- Importación
UPDATE hito SET orden = 4 WHERE id = 4; -- Crédito
UPDATE hito SET orden = 5 WHERE id = 5; -- Facturación
UPDATE hito SET orden = 6 WHERE id = 6; -- Pago
UPDATE hito SET orden = 7 WHERE id = 7; -- Inmatriculación
UPDATE hito SET orden = 8 WHERE id = 8; -- Programación
UPDATE hito SET orden = 9 WHERE id = 9; -- Entrega

-- ------------------------------------------------------------
-- 3. Insertar subetapas maestras (limpias, sin fechas)
--    hito_id: 1=Importación, 2=Asignación, 3=PDI (Carrozado)
--             4=Crédito, 5=Facturación, 6=Pago
--             7=Inmatriculación, 8=Programación, 9=Entrega
-- ------------------------------------------------------------

-- IMPORTACIÓN (8 subetapas)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (1, 'Solicitud negocio',    1, NULL, NULL),
  (1, 'Pedido fábrica',       2, NULL, NULL),
  (1, 'Confirmación fábrica', 3, NULL, NULL),
  (1, 'Liberación de pedido', 4, NULL, NULL),
  (1, 'Salida de fábrica',    5, NULL, NULL),
  (1, 'Embarque',             6, NULL, NULL),
  (1, 'Llegada',              7, NULL, NULL),
  (1, 'En almacén',           8, NULL, NULL);

-- PDI (CARROZADO) (4 subetapas)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (3, 'Llegada Carrocero', 1, NULL, NULL),
  (3, 'Inicio PDI',        2, NULL, NULL),
  (3, 'Salida PDI',        3, NULL, NULL),
  (3, 'Salida Carrocero',  4, NULL, NULL);

-- ASIGNACIÓN (2 subetapas)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (2, 'Pre-Asignación',   1, NULL, NULL),
  (2, 'Asig. Definitiva', 2, NULL, NULL);

-- CRÉDITO (2 subetapas)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (4, 'Solicitud crédito', 1, NULL, NULL),
  (4, 'Aprobación',        2, NULL, NULL);

-- FACTURACIÓN (1 subetapa)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (5, 'Emisión factura', 1, NULL, NULL);

-- PAGO (1 subetapa)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (6, 'Pago confirmado', 1, NULL, NULL);

-- INMATRICULACIÓN (10 subetapas)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (7, 'Emisión de documentos',         1,  NULL, NULL),
  (7, 'Recepción de documentos',       2,  NULL, NULL),
  (7, 'Recep. doc Carrocería',         3,  NULL, NULL),
  (7, 'Entrega exp. a tramitador',     4,  NULL, NULL),
  (7, 'Observado por AAP',             5,  NULL, NULL),
  (7, 'Calificación SUNARP',           6,  NULL, NULL),
  (7, 'Observado SUNARP',              7,  NULL, NULL),
  (7, 'Reingresado',                   8,  NULL, NULL),
  (7, 'Inscrito',                      9,  NULL, NULL),
  (7, 'Recepción de Placas de Rodaje', 10, NULL, NULL);

-- PROGRAMACIÓN (2 subetapas)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (8, 'Unidad Lista',   1, NULL, NULL),
  (8, 'Fecha agendada', 2, NULL, NULL);

-- ENTREGA (1 subetapa)
INSERT INTO subetapa (hito_id, nombre, orden, campo_staging_real, campo_staging_plan) VALUES
  (9, 'Entregado al Cliente', 1, NULL, NULL);

-- ------------------------------------------------------------
-- 4. Verificación
-- ------------------------------------------------------------
SELECT
  h.orden   AS hito_orden,
  h.nombre  AS hito,
  s.orden   AS sub_orden,
  s.nombre  AS subetapa
FROM subetapa s
JOIN hito h ON h.id = s.hito_id
ORDER BY h.orden, s.orden;

COMMIT;
