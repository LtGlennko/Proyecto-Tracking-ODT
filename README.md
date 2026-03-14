# Tracking OTD — Grupo Kaufmann

Sistema de seguimiento de ventas y entregas de vehiculos para **Grupo Kaufmann (Peru)**.
Permite monitorear el ciclo completo de cada VIN desde la solicitud de compra hasta la entrega al cliente.

## Estructura del Proyecto

```
Proyecto Tracking ODT/
├── kaufmann-workspace/    # Frontend — Angular 17 + Nx + TailwindCSS
├── tracking-otd-api/      # Backend  — NestJS 10 + TypeORM 0.3 + PostgreSQL 15
└── README.md
```

## Stack Tecnologico

| Capa       | Tecnologia                                         |
|------------|-----------------------------------------------------|
| Frontend   | Angular 17, Nx Monorepo, NgRx Signal Store, TailwindCSS |
| Backend    | NestJS 10, TypeORM 0.3, PostgreSQL 15               |
| Auth       | Azure AD B2C (JWT RS256)                             |
| Infra      | Docker Compose (PostgreSQL + pgAdmin)                |
| Docs API   | Swagger/OpenAPI en `/api/docs`                       |

## Dominio de Negocio

### Empresas
- **Divemotor** — Vehiculos comerciales (camiones)
- **Andes Motor** — Vehiculos ligeros (autos)
- **Andes Maq** — Maquinaria pesada

### Tipos de Vehiculo
| ID | Tipo             | Color   |
|----|------------------|---------|
| 1  | Camion           | #2E75B6 |
| 2  | Bus              | #7C3AED |
| 3  | Maquinaria       | #EA580C |
| 4  | Vehiculo Ligero  | #0EA5E9 |

### 9 Hitos del Flujo
Cada VIN atraviesa 9 hitos organizados en dos carriles que se ejecutan en paralelo:

```
Carril Financiero:  credito → facturacion → pago
Carril Operativo:   importacion → asignacion → pdi → inmatriculacion → programacion → entrega
```

Cada hito se descompone en **subetapas** con mapeo directo a campos de `staging_vin`.

### Estados del VIN
- **A TIEMPO** — Todas las subetapas dentro del SLA
- **DEMORADO** — Al menos una subetapa fuera del SLA
- **FINALIZADO** — Todas las subetapas completadas

### Grupos Paralelos
Los hitos se agrupan en **grupos paralelos** por tipo de vehiculo, permitiendo ejecucion simultanea de hitos financieros y operativos.

## Inicio Rapido

### Prerequisitos
- Node.js >= 18
- Docker y Docker Compose
- npm >= 9

### 1. Base de datos (Docker)

```bash
cd tracking-otd-api
docker compose up postgres pgadmin -d
```

- **PostgreSQL:** `localhost:5432` (user: `appuser`, pass: `1q2w3e`, db: `appwebdb01`)
- **pgAdmin:** `http://localhost:5050` (email: `admin@kaufmann.com`, pass: `admin123`)

### 2. Backend

```bash
cd tracking-otd-api
npm install
cp .env.example .env          # Configurar variables de entorno
npm run migration:run          # Ejecutar migraciones
npm run start:dev              # http://localhost:3001
```

Swagger disponible en: `http://localhost:3001/api/docs`

### 3. Frontend

```bash
cd kaufmann-workspace
npm install
npx nx serve tracking-otd     # http://localhost:4200
```

## Entornos de Base de Datos

| Entorno | Host            | Uso                        |
|---------|-----------------|----------------------------|
| Local   | localhost:5432  | Docker local (desarrollo)  |
| Remoto  | 172.20.200.30   | Servidor compartido (red interna) |

El entorno activo se configura en `tracking-otd-api/.env` via `DB_HOST`.

## Arquitectura

```
                  ┌─────────────────────────┐
                  │     Angular Frontend     │
                  │  (Nx + Signal Store)     │
                  └───────────┬─────────────┘
                              │ HTTP / JWT
                  ┌───────────▼─────────────┐
                  │     NestJS Backend       │
                  │  (/api/v1/*)             │
                  │  Swagger: /api/docs      │
                  └───────────┬─────────────┘
                              │ TypeORM
                  ┌───────────▼─────────────┐
                  │     PostgreSQL 15        │
                  │  (Docker / Remoto)       │
                  └─────────────────────────┘
```

### Modulos del Backend

| Modulo         | Responsabilidad                                |
|----------------|------------------------------------------------|
| auth           | Azure AD B2C, JWT, Guards, Bypass dev          |
| empresa        | CRUD empresas                                  |
| cliente        | CRUD clientes                                  |
| ficha          | Fichas de venta (agrupan VINs)                 |
| vin            | Gestion de VINs                                |
| tipo-vehiculo  | Catalogo de tipos de vehiculo                  |
| hitos          | Configuracion de hitos, subetapas, grupos paralelos |
| tracking       | Tracking por VIN (hitos + subetapas + sync)    |
| sla            | Configuracion y resolucion de SLAs             |
| alertas        | Alertas automaticas por SLA vencido (cron 6h)  |
| staging        | Ingesta de datos desde SAP/PROPED              |
| chat           | Mensajeria por ficha o VIN                     |
| usuario        | Gestion de usuarios y roles                    |
| health         | Health check (`/api/health`)                   |

### Librerias del Frontend (Nx)

| Libreria                          | Tipo        | Descripcion                          |
|-----------------------------------|-------------|--------------------------------------|
| `libs/shared/models`              | Shared      | Interfaces TypeScript                |
| `libs/shared/ui`                  | Shared      | Componentes reutilizables            |
| `libs/shared/utils`               | Shared      | Helpers, pipes                       |
| `libs/shared/auth`                | Shared      | Guards, interceptors                 |
| `libs/tracking-otd/data-access`   | Data Access | Stores NgRx, servicios API           |
| `libs/tracking-otd/feature-vin-tracking` | Feature | Tracking principal de VINs      |
| `libs/tracking-otd/feature-dashboard`    | Feature | Dashboard general              |
| `libs/tracking-otd/feature-alertas`      | Feature | Alertas y notificaciones       |
| `libs/tracking-otd/feature-analytics`    | Feature | Analitica y reportes           |
| `libs/tracking-otd/feature-chat`         | Feature | Chat por ficha/VIN             |
| `libs/tracking-otd/feature-staging`      | Feature | Importacion masiva             |
| `libs/tracking-otd/feature-admin`        | Feature | Panel de administracion        |

## Rutas del Frontend

| Ruta                           | Componente          | Acceso       |
|--------------------------------|---------------------|--------------|
| `/login`                       | LoginComponent      | Publico      |
| `/auth/microsoft/callback`     | AuthCallback        | Publico      |
| `/tracking`                    | VIN Tracking        | Autenticado  |
| `/dashboard`                   | Dashboard           | Autenticado  |
| `/alertas`                     | Alertas             | Autenticado  |
| `/analytics`                   | Analytics           | Autenticado  |
| `/chat`                        | Chat                | Autenticado  |
| `/staging`                     | Staging Import      | Autenticado  |
| `/admin`                       | Admin Panel         | Admin only   |

## Flujo de Datos: staging_vin → Tracking

```
Excel SAP/PROPED
      │
      ▼
  staging_vin (upsert por VIN)
      │
      ▼
  TrackingService.syncFromStaging(vinId)
      │
      ├── Lee subetapa.campo_staging_vin (mapeo columna)
      ├── Busca valor en staging_vin[campo]
      └── Actualiza vin_subetapa_tracking.fecha_real
```

### Mapeo de Campos (staging_vin → subetapas)

Las 12 subetapas con mapeo directo tienen `campo_staging_vin` en la tabla `subetapa`.
Las 5 subetapas GAP (manuales) no tienen mapeo y se actualizan via API:

| GAP Manual         | Descripcion                |
|--------------------|----------------------------|
| Solicitud Credito  | Inicio proceso financiero  |
| Aprobacion         | Credito aprobado           |
| Pago Confirmado    | Pago recibido              |
| Unidad Lista       | Vehiculo preparado         |
| Cita Agendada      | Entrega programada         |

## Esquema de Base de Datos (tablas principales)

```
empresa ──┐
           ├── ficha ──── vin ──┬── vin_hito_tracking
cliente ──┘                     ├── vin_subetapa_tracking
                                └── staging_vin

tipo_vehiculo ──┬── hito_tipo_vehiculo ──── hito ──── subetapa
                ├── subetapa_tipo_vehiculo
                ├── subetapa_config
                └── sla_config

grupo_paralelo ──── hito_tipo_vehiculo

usuario ──── usuario_empresa
```

## Migraciones

Las migraciones TypeORM se encuentran en `tracking-otd-api/src/migrations/`:

```bash
# Generar nueva migracion
npm run migration:generate --name=NombreDescriptivo

# Ejecutar migraciones pendientes
npm run migration:run
```

Las migraciones son la **fuente de verdad** del esquema. Nunca usar `synchronize: true`.

## Design System

| Token           | Valor     | Uso                    |
|-----------------|-----------|------------------------|
| Brand Navy      | `#1E3A5F` | Headers, sidebar       |
| Brand Blue      | `#2E75B6` | Acciones primarias     |
| Status On Time  | `#10b981` | Emerald — a tiempo     |
| Status Delayed  | `#ef4444` | Red — demorado         |
| Status Done     | `#6b7280` | Slate — finalizado     |
| Status Active   | `#3b82f6` | Blue — en progreso     |
| Font Principal  | Plus Jakarta Sans |                 |
| Font Mono       | JetBrains Mono    |                 |

## Autenticacion

- **Produccion:** Azure AD B2C con flujo `B2C_1_signupsignin`
- **Desarrollo:** Bypass habilitado via `AUTH_BYPASS_ENABLED=true` en `.env`
- **Roles:** administrador, supervisor, asesor_comercial

## Scripts Utiles

### Backend (`tracking-otd-api/`)
```bash
npm run start:dev          # Servidor dev con hot-reload
npm run build              # Compilar TypeScript
npm run migration:run      # Ejecutar migraciones
npm run migration:generate --name=X  # Generar migracion
npm run seed               # Seed data
npm test                   # Tests unitarios (Jest)
npm run test:cov           # Cobertura de tests
```

### Frontend (`kaufmann-workspace/`)
```bash
npx nx serve tracking-otd           # Dev server (port 4200)
npx nx build tracking-otd           # Build produccion
npx nx test tracking-otd            # Tests unitarios
npx nx lint tracking-otd            # Linting
npx nx graph                        # Visualizar dependencias Nx
```

### Docker
```bash
cd tracking-otd-api
docker compose up postgres pgadmin -d       # Solo BD + pgAdmin
docker compose --profile full up -d         # Todo (incluye API)
docker exec tracking-otd-postgres psql -U appuser -d appwebdb01 -c "SQL"  # SQL directo
```
