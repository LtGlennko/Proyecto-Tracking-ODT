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
- **BD Activa:** Solo Docker local (`localhost:5432`). NO usar servidor remoto `172.20.200.30`.
- **Responsabilidades:**
  - Ejecutar SQL de migraciones manualmente cuando TypeORM no puede conectar
  - Verificar estado del esquema vs entities
  - Mantener datos seed consistentes
  - Limpiar/resetear configuraciones para testing
- **Reglas:**
  - NUNCA usar `synchronize: true`
  - NUNCA apuntar a `172.20.200.30` — solo Docker local
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
- **9 hitos:** importacion, asignacion, pdi, credito, facturacion, pago, inmatriculacion, programacion, entrega
- **Carriles:** financiero, operativo (ejecución paralela por grupo)
- **Estados VIN:** A TIEMPO | DEMORADO | FINALIZADO

## Lógica Cross-Cutting: Grupos Paralelos

Los grupos paralelos agrupan hitos que se ejecutan simultáneamente. Su ciclo de vida es:

1. **Creación on-demand:** Frontend envía `grupoId=0` (sentinel) → Backend `POST /v1/hitos/grupos-paralelos` crea grupo real → devuelve ID
2. **Asignación:** Frontend `PATCH /v1/hitos/config/{tipo}/hito/{hitoId}` con `grupoParaleloId`
3. **Auto-eliminación:** Después de mover un hito, frontend verifica si grupo anterior quedó vacío → `DELETE /v1/hitos/grupos-paralelos/{id}?tipoVehiculo={tipo}`
4. **Backend `deleteGrupoForTipo`:** Reasigna hitos huérfanos al grupo previo por orden visual antes de eliminar el grupo

### Carriles (Financiero / Operativo)
Cada hito pertenece a un carril dentro de su grupo:
- **Financiero:** crédito, facturación, pago (flujo financiero)
- **Operativo:** PDI, inmatriculación, programación, entrega (flujo operativo)
- Los carriles permiten ejecución paralela real dentro del mismo grupo

## Convenciones Generales
- Idioma del código: inglés para nombres técnicos, español para dominio de negocio
- Commits en español
- API versionada bajo `/api/v1/`
- Operaciones siempre scoped por tipo de vehículo
