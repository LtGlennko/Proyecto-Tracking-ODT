# Tracking OTD API — Backend Agent

> Este archivo es leído automáticamente por el agente backend. Contiene las reglas y contexto para trabajar en `tracking-otd-api/`.

## Contexto del Proyecto
Sistema de seguimiento de ventas y entregas de vehículos para Grupo Kaufmann.
3 empresas: Divemotor, Andes Motor, Andes Maq.
Flujo: Solicitud → Compra → Entrega (10 hitos, 31 subetapas).

## Stack
- NestJS 10.3 + TypeORM 0.3.20 + PostgreSQL 15.17 (Docker local) / 16.13 (servidor remoto)
- TypeScript 5.3.3
- xlsx 0.18.5, docx 9.6.1
- Auth: Azure AD B2C → JWT (RS256)
- Logger: Winston (nest-winston)
- Tests: Jest + Supertest
- Docs: Swagger en /api/docs

## Reglas de Arquitectura — NUNCA violar

### Campos CALCULADOS — jamás persistir en BD
- `diferencia_dias` en tracking → calcular como `(fechaReal - fechaPlan)` en días
- `dias_critico` en sla_config → calcular como `diasObjetivo + diasTolerancia`
- `estado_general` del VIN → derivar dinámicamente del tracking computado
- KPIs del VIN → calcular dinámicamente, nunca en BD

### Migraciones — siempre que cambies una entidad
- NUNCA usar `synchronize: true`
- Comando: `npm run migration:generate --name=DescripcionDelCambio`
- Revisar el SQL generado antes de ejecutar

### SLA — lógica de precedencia
- Score = count(dimensiones NOT NULL)
- Mayor score = más específico = mayor prioridad
- Lógica en `SlaService.resolve()`, nunca en BD

### staging_vin — fuente de verdad para fechas
- Upsert por VIN (INSERT ON CONFLICT UPDATE)
- PROPED prevalece sobre SAP para: etd, eta, fecha_llegada_aduana
- SAP prevalece para: fechas de facturación, preasignación, asignación
- Fechas real: desde `subetapa.campo_staging_real`
- Fechas plan: `subetapa.campo_staging_plan` tiene prioridad, SLA como fallback
- Nuevas columnas: `cond_pago`, `descripcion_cond_pago`, `archivo_fuente`, 22 columnas de inmatriculación
- `syncFromStaging` fue removido — tracking se calcula dinámicamente

### Chat — constraint XOR
- Un chat pertenece a una ficha O a un VIN, nunca a ambos
- Validar en `ChatService.create()` antes de insertar

### Auth — perfiles
- `superadmin` → acceso completo incluyendo config de hitos maestros y mapeo de campos
- `administrador` → acceso completo (PATCH/PUT usuarios permitido)
- `supervisor` → puede actualizar tracking y ver todo
- `asesor_comercial` → solo lectura + actualizar GAPs manuales de sus VINs

## Estructura de Módulos
```
src/modules/
  empresa/        → empresa.entity, empresa.service, empresa.controller
  hitos/          → grupo_paralelo, hito (con icono), subetapa (campo_staging_real, campo_staging_plan)
  tracking/       → cálculo dinámico de tracking (sin tablas vin_hito/subetapa_tracking). Summary endpoint: /tracking/summary → { total, demorado, enRiesgo }. Completeness filter: solo VINs con datos PROPED + 5 campos fecha
  sla/            → sla_config (sin chk_sla_min_dimension), SlaService.resolve(), SlaService.getStatus()
  alertas/        → alerta, alerta_accion, AlertasScheduler (@Cron cada 6h)
  chat/           → chat, mensaje, mensaje_etiqueta, notificacion
  staging/        → staging_vin, parse PROPED/SAP Excel, upsert
  fuentes-vin/    → CRUD fuentes de datos
  mapeo-campos-vin/ → CRUD mapeo campos + grouped + staging-columns + reorder
  auth/           → AzureAdStrategy, JwtAuthGuard, RolesGuard
  health/         → /api/health (público)
```

## DB Credentials (desarrollo local — ÚNICA BD)
- Host: localhost:5432 (Docker local)
- Database: appwebdb01
- User: appuser / Pass: 1q2w3e
- Docker: `cd tracking-otd-api && docker compose up postgres pgadmin -d`
- pgAdmin: http://localhost:5050
- **IMPORTANTE:** NO usar servidor remoto `172.20.200.30`. Solo Docker local.
- Conexión directa: `docker exec tracking-otd-postgres psql -U appuser -d appwebdb01 -c "SQL"`

## Comandos Frecuentes
```bash
npm run start:dev
npm run migration:generate --name=NombreCambio
npm run migration:run
npm run test
npm run test:cov
```

## Entidades de Configuración por Tipo de Vehículo
- `HitoTipoVehiculo` — grupoParaleloId, carril (financiero/operativo), orden, activo
- `SubetapaTipoVehiculo` — orden, activo, campoStagingReal, campoStagingPlan
- `GrupoParalelo` — Agrupación para ejecución simultánea de hitos
- Operaciones SIEMPRE scoped por tipo de vehículo
- Grupos paralelos: crear on-demand, eliminar automáticamente cuando quedan vacíos
- `deleteGrupoForTipo(grupoId, tipoVehiculo)`: reasigna hitos al grupo previo por orden visual, luego elimina el grupo
- Endpoints: `POST /v1/hitos/grupos-paralelos`, `DELETE /v1/hitos/grupos-paralelos/:id?tipoVehiculo=X`
- `PATCH /v1/hitos/config/:tipo/hito/:hitoId` — actualiza grupoParaleloId, carril, orden, activo

## Patrones Obligatorios
- Service pattern: lógica de negocio en `*.service.ts`, no en controllers
- Controllers solo validan input y delegan al service
- Transactions con `queryRunner` para operaciones multi-tabla
- Todos los endpoints bajo `/api/v1/`
- DTOs con decoradores class-validator (`@IsString()`, `@IsNumber()`, etc.)

## Cobertura de Fechas en staging_vin
- Fechas real: mapeadas dinámicamente via `subetapa.campo_staging_real`
- Fechas plan: mapeadas via `subetapa.campo_staging_plan` (prioridad) o calculadas por SLA (fallback)
- Baseline: cálculo group-aware con encadenamiento secuencial same-carril
- 3 proxy: fcc→InicioTrámite, fclr→PlacasRecibidas, fechaColocacion→PedidoFábrica
- 5 GAP manual: SolicitudCrédito, Aprobación, PagoConfirmado, UnidadLista, CitaAgendada

## Tablas Eliminadas (2026-03-19)
- `vin_hito_tracking`, `vin_subetapa_tracking`, `subetapa_config`
- Columnas eliminadas de `hito`: `grupo_paralelo_id`, `usuario_responsable_id`, `tipo_vehiculo`, `slug`
- Columna eliminada de `ficha`: `forma_pago`
- Constraint eliminado: `chk_sla_min_dimension` de `sla_config`

## Tablas Eliminadas (2026-03-23)
- `vin`, `ficha`, `cliente` — todos los datos ahora derivados de `staging_vin` vía `vista_tracking_vin`
- `vista_tracking_vin` es la vista principal: joins staging_vin + tipo_vehiculo, deriva cliente/ficha/empresa
- COALESCE defaults: `cliente_nombre` → 'Sin Cliente', `ficha_codigo` → 'Sin Ficha', `cliente_comex` STOCK → NULL
- `tipo_vehiculo_id` derivado de `linea_negocio` (VC→1, Buses→2, Maquinarias→3, Autos→4, default→2)
- `empresa_id` defaults to 1 (Divemotor)

## Métodos Removidos
- `syncFromStaging`, `getTrackingVin`, `updateHitoTracking`, `updateSubetapaTracking`
