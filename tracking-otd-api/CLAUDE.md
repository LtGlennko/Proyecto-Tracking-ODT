# Tracking OTD API — Backend Agent

> Este archivo es leído automáticamente por el agente backend. Contiene las reglas y contexto para trabajar en `tracking-otd-api/`.

## Contexto del Proyecto
Sistema de seguimiento de ventas y entregas de vehículos para Grupo Kaufmann.
3 empresas: Divemotor, Andes Motor, Andes Maq.
Flujo: Solicitud → Compra → Entrega (9 hitos, 20 subetapas).

## Stack
- NestJS 10 + TypeORM 0.3 + PostgreSQL 15
- Auth: Azure AD B2C → JWT (RS256)
- Logger: Winston (nest-winston)
- Tests: Jest + Supertest
- Docs: Swagger en /api/docs

## Reglas de Arquitectura — NUNCA violar

### Campos CALCULADOS — jamás persistir en BD
- `diferencia_dias` en tracking → calcular como `(fechaReal - fechaPlan)` en días
- `dias_critico` en sla_config → calcular como `diasObjetivo + diasTolerancia`
- `estado_general` del VIN → derivar de `vin_hito_tracking.estado[]`
- KPIs del VIN → calcular en `VinService.findOne()`, nunca en BD

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
- Después de cada upsert → llamar `TrackingService.syncFromStaging(vinId)`

### Chat — constraint XOR
- Un chat pertenece a una ficha O a un VIN, nunca a ambos
- Validar en `ChatService.create()` antes de insertar

### Auth — perfiles
- `administrador` → acceso completo
- `supervisor` → puede actualizar tracking y ver todo
- `asesor_comercial` → solo lectura + actualizar GAPs manuales de sus VINs

## Estructura de Módulos
```
src/modules/
  empresa/      → empresa.entity, empresa.service, empresa.controller
  cliente/
  ficha/
  vin/          → vin.service incluye calcularEstadoGeneral
  hitos/        → grupo_paralelo, hito, subetapa, subetapa_config
  tracking/     → vin_hito_tracking, vin_subetapa_tracking, syncFromStaging
  sla/          → sla_config, SlaService.resolve(), SlaService.getStatus()
  alertas/      → alerta, alerta_accion, AlertasScheduler (@Cron cada 6h)
  chat/         → chat, mensaje, mensaje_etiqueta, notificacion
  staging/      → staging_vin, parse PROPED/SAP Excel, upsert
  auth/         → AzureAdStrategy, JwtAuthGuard, RolesGuard
  health/       → /api/health (público)
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
- `SubetapaTipoVehiculo` — orden, activo, campoStagingVin
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
- 12 directas: auto-poblan desde staging (TrackingService.syncFromStaging)
- 3 proxy: fcc→InicioTrámite, fclr→PlacasRecibidas, fechaColocacion→PedidoFábrica
- 5 GAP manual: SolicitudCrédito, Aprobación, PagoConfirmado, UnidadLista, CitaAgendada
