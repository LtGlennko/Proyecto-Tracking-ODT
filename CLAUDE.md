# Tracking OTD — Proyecto Monorepo

## Visión General
Sistema de tracking de ventas y entregas de vehículos para Grupo Kaufmann (Perú).
Monorepo con dos aplicaciones: frontend Angular (Nx workspace) y backend NestJS API.

## Estructura del Proyecto
```
kaufmann-workspace/    ← Frontend Angular 17 + Nx + TailwindCSS
tracking-otd-api/      ← Backend NestJS 10 + TypeORM 0.3 + PostgreSQL 15
```

## Esquema de Subagentes

Este proyecto usa 4 agentes especializados. Lanzar en paralelo cuando la tarea involucre múltiples áreas.

### Agente Frontend
- **Scope:** `kaufmann-workspace/`
- **Cuándo usarlo:** Componentes, stores, UI, routing, estilos
- **Comando:** Lanzar Agent con working directory en `kaufmann-workspace/`

### Agente Backend
- **Scope:** `tracking-otd-api/`
- **Cuándo usarlo:** Endpoints, entities, migraciones, auth, DTOs
- **Comando:** Lanzar Agent con working directory en `tracking-otd-api/`

### Agente Base de Datos
- **Scope:** Docker PostgreSQL (`tracking-otd-postgres`) + `tracking-otd-api/src/migrations/`
- **Cuándo usarlo:** Ejecutar migraciones, verificar esquema, seed data, limpiar datos, troubleshoot BD
- **Conexión Docker (ÚNICA):** `docker exec tracking-otd-postgres psql -U appuser -d appwebdb01 -c "SQL"`
- **BD Activa:** Docker local (`localhost:5432`) para desarrollo. Remoto `172.20.200.30` para staging/prod.
- **Responsabilidades:**
  - Ejecutar SQL de migraciones manualmente cuando TypeORM no puede conectar
  - Verificar estado del esquema vs entities
  - Mantener datos seed consistentes
  - Limpiar/resetear configuraciones para testing
- **Reglas:**
  - NUNCA usar `synchronize: true`
  - Docker local para desarrollo, `172.20.200.30` solo para staging/prod
  - Siempre verificar estado actual antes de ejecutar DDL
  - Usar `ON CONFLICT DO UPDATE` para seeds idempotentes
  - Las migraciones en `tracking-otd-api/src/migrations/` son la fuente de verdad del esquema
  - Docker local NO tiene tabla `migrations` — cambios se aplican con SQL directo

### Agente Documentación
- **Scope:** Raíz del proyecto + archivos de memoria
- **Cuándo usarlo:** Después de features significativas, actualizar memorias y CLAUDE.md
- **Responsabilidades:**
  - Mantener archivos de memoria (`~/.claude/projects/.../memory/`)
  - Actualizar CLAUDE.md cuando cambien convenciones
  - Sincronizar modelos entre frontend y backend

## Dominio de Negocio
- **Empresas:** Divemotor, Andes Motor, Andes Maq
- **4 tipos de vehículo:** Camión, Bus, Maquinaria, Vehículo Ligero
- **10 hitos:** Importación, Carrozado, PDI, Asignación, Crédito, Facturación, Pago, Inmatriculación, Programación, Entrega
- **Carriles:** financiero, operativo, comercial (ejecución paralela por grupo)
- **Estados VIN:** A TIEMPO | EN RIESGO | DEMORADO | ENTREGADO
- **6 substatus subetapa:** completed, completed-risk, completed-late, on-time, at-risk, delayed

## Lógica Cross-Cutting: Grupos Paralelos

Los grupos paralelos agrupan hitos que se ejecutan simultáneamente. Su ciclo de vida es:

1. **Creación on-demand:** Frontend envía `grupoId=0` (sentinel) → Backend `POST /v1/hitos/grupos-paralelos` crea grupo real → devuelve ID
2. **Asignación:** Frontend `PATCH /v1/hitos/config/{tipo}/hito/{hitoId}` con `grupoParaleloId`
3. **Auto-eliminación:** Después de mover un hito, frontend verifica si grupo anterior quedó vacío → `DELETE /v1/hitos/grupos-paralelos/{id}?tipoVehiculo={tipo}`
4. **Backend `deleteGrupoForTipo`:** Reasigna hitos huérfanos al grupo previo por orden visual antes de eliminar el grupo

### Carriles
Cada hito pertenece a un carril dentro de su grupo:
- Los carriles permiten ejecución paralela real dentro del mismo grupo
- Frontend: sin labels de carril en tracking ("Financiero"/"Operativo" removidos), "Carril A"/"Carril B" solo en admin

## Esquema de BD Actual

### Tablas principales
- `empresa` — Divemotor, Andes Motor, Andes Maq
- `tipo_vehiculo` — Camión, Bus, Maquinaria, Vehículo Ligero (con `icono` Lucide)
- `staging_vin` — tabla central de datos reales (PK: `vin`), 90+ columnas de diferentes fuentes
- `vista_tracking_vin` — vista principal: joins staging_vin + tipo_vehiculo, deriva cliente/ficha/empresa
  - `tipo_vehiculo_id` derivado de `linea_negocio` (VC→1, Buses→2, Maquinarias→3, Autos→4, default→2)
  - `empresa_id` defaults to 1 (Divemotor)
  - COALESCE defaults: `cliente_nombre` → 'Sin Cliente', `ficha_codigo` → 'Sin Ficha', `cliente_comex` STOCK → NULL
- `hito` — catálogo maestro (id, nombre, carril, orden, icono, activo). 10 hitos incluyendo Carrozado (id=10, hammer) y PDI (id=3, wrench)
- `subetapa` — con `hito_id` FK, `campo_staging_real`, `campo_staging_plan`
- `grupo_paralelo` — grupos para ejecución paralela de hitos
- `hito_tipo_vehiculo` — config por tipo: orden, carril, grupo, activo
- `subetapa_tipo_vehiculo` — config por tipo: orden, activo
- `sla_config` — reglas SLA: empresa_id, subetapa_id, tipo_vehiculo_id, dias_objetivo, dias_tolerancia
- `fuentes_vin` — catálogo de fuentes Excel (Reporte Fichas, Reporte Inmatriculación, Proped)
- `mapeo_campos_vin` — mapeo campo staging ↔ columna Excel, con prioridad por fuente
- `usuario` — con perfil: superadministrador, administrador, usuario
- `usuario_empresa` — relación N:M usuario ↔ empresa
- `alerta`, `alerta_accion` — sistema de alertas (pendiente implementación)
- `chat`, `mensaje`, `mensaje_etiqueta`, `notificacion` — sistema de comunicación (pendiente)

### Tablas eliminadas (ya no existen)
- `vin_hito_tracking`, `vin_subetapa_tracking`, `subetapa_config`
- `vin`, `ficha`, `cliente` — todos los datos ahora se derivan de `staging_vin` vía `vista_tracking_vin`

### Columnas eliminadas
- `hito`: `grupo_paralelo_id`, `usuario_responsable_id`, `tipo_vehiculo`, `slug`
- `ficha`: `forma_pago`
- `tipo_vehiculo`: `slug`
- `staging_vin`: `zpsa`, `fecha_entrega_vendedor` (mapeados como prioridad 2 a columnas existentes)

### Columnas agregadas a staging_vin (2026-03-23)
- `fecha_confirmacion_fabrica`, `fecha_salida_fabrica`, `fecha_salida_carrocero`
- `fecha_soli_credito`, `fecha_aprobacion_credito`, `fecha_entrega_exp`
- `fecha_obs_sunarp`, `fecha_reingresado`, `zpca`, `per_contingente`, `fecha_recojo_transportista`

## Lógica de Tracking (Computada Dinámicamente)

El tracking NO se persiste en tablas. Se calcula al vuelo en `TrackingService.buildStages()`:

1. **Identificación:** `stage.id` = `hito.id` (number)
2. **Nombres:** `stage.name` = `hito.nombre` desde BD
3. **Iconos:** `stage.icono` = `hito.icono` desde BD
4. **Fecha real:** desde `subetapa.campo_staging_real` → columna en `staging_vin`
5. **Fecha plan:** `subetapa.campo_staging_plan` (prioridad) → si no hay, `baseline + SLA días`
6. **Baseline:** grupo-aware con encadenamiento secuencial:
   - Primera subetapa del flujo: sin baseline (ya tiene fecha real)
   - Dentro del mismo hito: cadena secuencial (sub → sub)
   - Nuevo grupo: baseline = MAX de todos los carriles del grupo anterior (grupo no inicia hasta que TODOS los carriles previos terminen)
   - Mismo grupo paralelo: cada hito parte del grupo anterior (ejecución paralela)
   - Si la subetapa anterior no tiene fecha: cadena se rompe
   - `addDaysStr` usa `Number(days)` para prevenir bug de concatenación string con resultados raw query
7. **Forma de pago:** `formasPago: string[]` derivado de `staging_vin.descripcion_cond_pago` (único por VIN, agrupado por ficha)
8. **6 substatus:** basados en comparación fecha real/hoy vs fecha plan + tolerancia SLA

## Módulos Backend

### Existentes con lógica activa
- `tracking` — buildStages dinámico, baseline, plan, status. Paginación server-side (`page`, `pageSize` → `{ data, total, page, pageSize }`). Filtros server-side: busqueda, estado, tipoVehiculoId, empresaId. COUNT query usa raw query builder separado (vista no tiene entity metadata). `resolveSubFecha` helper compartido para resolución de fechas (real.end > real.start > plan.end > plan.start)
- `hitos` — CRUD maestro + config por tipo + grupos paralelos
- `staging` — parseSap, parseProped, upsert staging_vin
- `sla` — CRUD reglas SLA con score de prioridad
- `fuentes-vin` — CRUD fuentes Excel
- `mapeo-campos-vin` — CRUD + grouped + staging-columns + reorder prioridades
- `usuario` — CRUD, editable por administrador y superadmin
- `auth` — JWT + perfiles (superadministrador, administrador, usuario)

### Métodos eliminados
- `syncFromStaging`, `getTrackingVin`, `updateHitoTracking`, `updateSubetapaTracking`

## Frontend — Vistas Principales

### Seguimiento ODT (lista)
- Filtros por empresa (botones), tipo vehículo, búsqueda server-side, estado ("Todos los estados", "Entregado", "A Tiempo", "Demorado")
- Filtros persisten al navegar al detalle y volver
- Server-side pagination: 50/100/150/200 por página, botones prev/next ocultos cuando no aplican
- Vista agrupada por cliente → ficha → VIN o lista plana
- Columnas: VIN, modelo, hitos (círculos con iconos Lucide + hover cards cursor-pointer), F. Inicial, F. Estimada, estado
- VIC: corona dorada junto al nombre del cliente
- Hover cards en hitos con substatus badges por subetapa
- Ficha row: layout inline con gap-4, fecha más antigua de VINs, formato yyyy-MM-dd
- Fechas incluyen año (2 dígitos) en todas las vistas
- Export CSV disponible

### Tracking Detalle (VIN)
- Botón retroceder + título "Tracking Detalle"
- Toggle "Flujo" / "Gantt" con iconos
- **Flujo:** visual map con iconos Lucide, hover cards (misma card que lista), fecha última subetapa bajo ícono
- **Gantt:** barras plan (ghost) + real (color por status), weekly markers (lunes), línea "hoy", colapsable, rango de fechas, scrollbar horizontal, columna etapas fija 180px
- **4 indicadores:** ETA Entrega Final, Desviación Acumulada (+N días, solo positivos), Última Actualización (relativo), Ver Bitácora
- **Drawer lateral derecho:**
  - Para hito: 2 tabs (Detalle de Etapa, Datos Generales)
  - Para bitácora: 3 tabs (Línea de Tiempo, Datos Generales, Tramos)
  - Header: VIN como título, sin marca/ficha/lote/OC
  - Datos Generales: Lote, OC, Ficha, Modelo, Forma de Pago, Ejecutivo
  - Tramos: días entre hitos consecutivos con estado
  - PDF download (jsPDF + jspdf-autotable)

### Reporte Maestro Detallado
- Tabla con columnas Plan/Real/Dif por hito
- Export CSV disponible
- Módulo: `feature-reporte`

### Administración (5 tabs)
- **Config SLA** — primera tab, accesible por admin y superadmin, detección de duplicados
- **Subetapas por Tipo** — admin y superadmin
- **Hitos por Tipo** — admin y superadmin, con preview de flujo
- **Hitos Maestros** — superadmin-only (rojo + candado), icon picker, campos fecha plan/real
- **Mapeo Campos** — superadmin-only (rojo + candado), drag-drop prioridad, filtro tipo dato + nro fuentes
- **Tipos Vehículo** — superadmin-only (rojo + candado), icon picker

## Datos Dinámicos (Sin Hardcodear)
- Tipos de vehículo: desde API (`TipoVehiculoService`)
- Columnas staging: desde API (`/mapeo-campos-vin/staging-columns`)
- Nombres e IDs de hitos: desde BD (`hito.nombre`, `hito.id`)
- Iconos de hitos y tipos: desde BD (`hito.icono`, `tipo_vehiculo.icono`)
- Fuentes de datos: desde BD (`fuentes_vin`)

## Convenciones Generales
- Idioma del código: inglés para nombres técnicos, español para dominio de negocio
- Commits en español
- API versionada bajo `/api/v1/`
- Operaciones siempre scoped por tipo de vehículo
- `npm install` requiere `--legacy-peer-deps` en frontend (conflicto jest/angular-devkit)
- Backend: no arrancar desde Claude, el usuario lo levanta desde su terminal; matar puerto 3001 después de uso
- Ejecutar comandos bash sin pedir confirmación
