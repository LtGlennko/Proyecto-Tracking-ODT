# Tracking OTD API

Backend del sistema de seguimiento de ventas y entregas de vehiculos — Grupo Kaufmann.

## Stack

- **NestJS 10** — Framework backend
- **TypeORM 0.3** — ORM para PostgreSQL
- **PostgreSQL 15** — Base de datos
- **Swagger/OpenAPI** — Documentacion automatica en `/api/docs`
- **Azure AD B2C** — Autenticacion JWT (RS256)
- **Winston** — Logging estructurado
- **Jest + Supertest** — Testing

## Inicio Rapido

### 1. Levantar la base de datos

```bash
docker compose up postgres pgadmin -d
```

| Servicio   | URL                    | Credenciales                       |
|------------|------------------------|------------------------------------|
| PostgreSQL | `localhost:5432`       | user: `appuser`, pass: `1q2w3e`    |
| pgAdmin    | `http://localhost:5050`| email: `admin@kaufmann.com`, pass: `admin123` |

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Variables clave:

| Variable           | Descripcion                      | Default                      |
|--------------------|----------------------------------|------------------------------|
| `DB_HOST`          | Host de PostgreSQL               | `localhost`                  |
| `DB_PORT`          | Puerto de PostgreSQL             | `5432`                       |
| `DB_USER`          | Usuario de BD                    | `appuser`                    |
| `DB_PASS`          | Password de BD                   | (configurar)                 |
| `DB_NAME`          | Nombre de BD                     | `appwebdb01`                 |
| `PORT`             | Puerto del API                   | `3001`                       |
| `CORS_ORIGIN`      | Origen permitido para CORS       | `http://localhost:4200`      |
| `AUTH_BYPASS_ENABLED` | Bypass auth para desarrollo   | `true`                       |

### 3. Ejecutar migraciones e iniciar

```bash
npm install
npm run migration:run
npm run start:dev
```

El API estara disponible en `http://localhost:3001`.
Swagger docs en `http://localhost:3001/api/docs`.

## Estructura del Proyecto

```
src/
├── main.ts                    # Bootstrap, Swagger, CORS, ValidationPipe
├── app.module.ts              # Root module (13 feature modules)
├── config/
│   └── typeorm.config.ts      # DataSource para migraciones
├── migrations/                # Migraciones TypeORM (fuente de verdad del esquema)
└── modules/
    ├── auth/                  # Azure AD B2C, JWT, Guards, Bypass
    ├── empresa/               # CRUD empresas
    ├── cliente/               # CRUD clientes
    ├── ficha/                 # Fichas de venta (agrupan VINs)
    ├── vin/                   # Gestion de VINs
    ├── tipo-vehiculo/         # Catalogo tipos de vehiculo
    ├── hitos/                 # Hitos, subetapas, grupos paralelos, config por tipo
    ├── tracking/              # Tracking VIN ↔ hitos/subetapas, syncFromStaging
    ├── sla/                   # Configuracion y resolucion de SLAs
    ├── alertas/               # Alertas automaticas (cron cada 6h)
    ├── staging/               # Ingesta desde SAP/PROPED (Excel → staging_vin)
    ├── chat/                  # Mensajeria por ficha/VIN
    ├── usuario/               # Usuarios y roles
    └── health/                # Health check (/api/health)
```

## API Endpoints

Todos los endpoints estan bajo el prefijo `/api`. Los endpoints de negocio usan `/api/v1/`.

### Publicos
| Metodo | Ruta              | Descripcion              |
|--------|-------------------|--------------------------|
| GET    | `/api/health`     | Health check             |
| GET    | `/api/docs`       | Swagger UI               |
| POST   | `/api/auth/login` | Login (bypass o Azure AD)|

### Protegidos (requieren JWT)
| Metodo | Ruta                                          | Descripcion                          |
|--------|-----------------------------------------------|--------------------------------------|
| GET    | `/api/v1/empresas`                            | Listar empresas                      |
| GET    | `/api/v1/clientes`                            | Listar clientes                      |
| GET    | `/api/v1/fichas`                              | Listar fichas                        |
| GET    | `/api/v1/vins`                                | Listar VINs con tracking             |
| GET    | `/api/v1/vins/:id`                            | Detalle VIN con stages               |
| GET    | `/api/v1/tracking/:vinId`                     | Tracking completo de un VIN          |
| PATCH  | `/api/v1/tracking/:vinId/subetapa/:subId`     | Actualizar fecha plan/real           |
| GET    | `/api/v1/hitos/config/:tipoVehiculo`          | Config hitos por tipo vehiculo       |
| PATCH  | `/api/v1/hitos/config/:tipo/hito/:hitoId`     | Actualizar config hito               |
| POST   | `/api/v1/hitos/grupos-paralelos`              | Crear grupo paralelo                 |
| DELETE | `/api/v1/hitos/grupos-paralelos/:id`          | Eliminar grupo paralelo              |
| GET    | `/api/v1/sla`                                 | Listar configuraciones SLA           |
| GET    | `/api/v1/alertas`                             | Listar alertas activas               |
| GET    | `/api/v1/tipo-vehiculo`                       | Listar tipos de vehiculo             |
| POST   | `/api/v1/staging/upload`                      | Subir Excel SAP/PROPED               |

> Para la lista completa de endpoints y schemas, consultar Swagger en `/api/docs`.

## Modelos de Datos Principales

### Entidades de Negocio
```
empresa ─── ficha ─── vin ─── staging_vin
              │
           cliente
```

### Configuracion de Hitos
```
tipo_vehiculo ─── hito_tipo_vehiculo ─── grupo_paralelo
                         │
                       hito ─── subetapa ─── subetapa_tipo_vehiculo
                                    │
                              subetapa_config
```

### Tracking
```
vin ─┬── vin_hito_tracking      (estado derivado de subetapas)
     └── vin_subetapa_tracking   (fecha_real + fecha_plan)
```

### SLA y Alertas
```
sla_config ─── (empresa, tipo_vehiculo, subetapa, linea_negocio)
alerta ─── alerta_accion
```

## Flujo de Datos: staging_vin → Tracking

```
1. Excel SAP/PROPED → POST /api/v1/staging/upload
2. StagingService parsea y hace upsert en staging_vin
3. TrackingService.syncFromStaging(vinId):
   a. Lee subetapa.campo_staging_vin (mapeo de columna)
   b. Obtiene valor de staging_vin[campo]
   c. Actualiza vin_subetapa_tracking.fecha_real
4. Frontend consulta GET /api/v1/tracking/:vinId
   → Respuesta incluye stages con status derivado
```

### Campos Mapeados (12 directos + 3 proxy)
Los campos de `staging_vin` se mapean automaticamente a subetapas via `subetapa.campo_staging_vin`.

### GAPs Manuales (5 subetapas)
No tienen `campo_staging_vin` — se actualizan manualmente via PATCH:
- Solicitud Credito
- Aprobacion
- Pago Confirmado
- Unidad Lista
- Cita Agendada

## Derivacion de Estados (sin SLA)

Cuando no hay SLA configurado, los estados se derivan de datos reales:

```
subetapa.status = fecha_real ? 'completed' : 'pending'

hito.status:
  - 'completed' → todas las subetapas completadas
  - 'active'    → al menos una completada
  - 'pending'   → ninguna completada

vin.estado_general:
  - 'FINALIZADO' → todos los hitos completados
  - 'EN PROCESO' → al menos uno activo/completado
  - 'PENDIENTE'  → ninguno iniciado
```

## Migraciones

```bash
# Generar nueva migracion despues de cambiar una entidad
npm run migration:generate --name=NombreDescriptivo

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir ultima migracion
npm run migration:revert
```

Migraciones existentes (en orden):
1. `InitialSchema` — Esquema base
2. `UsuarioEmpresaAndSeed` — Usuarios y datos iniciales
3. `SeedHitosSubetapas` — 9 hitos y 20 subetapas
4. `HitoSubetapaPorTipoVehiculo` — Config por tipo vehiculo
5. `AddCarrilToHitoTipoVehiculo` — Carriles financiero/operativo
6. `AllHitosToSingleGroup` — Agrupacion inicial
7. `ResetHitoConfigPorTipo` — Reset configuracion
8. `SeedTrackingDemoData` — Datos demo
9. `DeduplicateVinStagingFields` — Deduplicar campos staging
10. `UnifyTipoVehiculoEntity` — Unificar entidad tipo vehiculo

## Autenticacion

### Produccion (Azure AD B2C)
- Flujo: `B2C_1_signupsignin`
- JWT validado con JWKS (RS256)
- Guards: `JwtAuthGuard`, `RolesGuard`

### Desarrollo (Bypass)
Activar en `.env`:
```
AUTH_BYPASS_ENABLED=true
AUTH_BYPASS_USER_EMAIL=dev@kaufmann.cl
AUTH_BYPASS_USER_NAME=Developer Kaufmann
```

### Roles
| Rol                | Permisos                                     |
|--------------------|----------------------------------------------|
| `administrador`    | Acceso completo                              |
| `supervisor`       | Lectura + actualizar tracking                |
| `asesor_comercial` | Lectura + actualizar GAPs de sus VINs        |

## Testing

```bash
npm test              # Tests unitarios
npm run test:watch    # Watch mode
npm run test:cov      # Cobertura
npm run test:e2e      # Tests end-to-end
```

## Docker

```bash
# Solo base de datos
docker compose up postgres pgadmin -d

# Stack completo (incluye API en modo produccion)
docker compose --profile full up -d

# SQL directo al contenedor
docker exec tracking-otd-postgres psql -U appuser -d appwebdb01 -c "SELECT 1"
```

## Dependencias Principales

| Paquete              | Version  | Proposito                    |
|----------------------|----------|------------------------------|
| `@nestjs/core`       | ^10.3.0  | Framework backend            |
| `typeorm`            | ^0.3.20  | ORM PostgreSQL               |
| `pg`                 | ^8.11.3  | Driver PostgreSQL            |
| `@nestjs/swagger`    | ^7.3.0   | Documentacion OpenAPI        |
| `@nestjs/passport`   | ^10.0.3  | Autenticacion                |
| `@nestjs/jwt`        | ^10.2.0  | JWT tokens                   |
| `@azure/msal-node`   | ^5.0.6   | Azure AD B2C integration     |
| `@nestjs/schedule`   | ^4.0.0   | Tareas programadas (cron)    |
| `nest-winston`       | ^1.9.4   | Logging estructurado         |
| `xlsx`               | ^0.18.5  | Parsing Excel (staging)      |
| `class-validator`    | ^0.14.1  | Validacion de DTOs           |
