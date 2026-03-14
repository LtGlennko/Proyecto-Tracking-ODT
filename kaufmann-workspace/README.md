# Kaufmann Workspace — Frontend

Frontend del sistema Tracking OTD para Grupo Kaufmann.
Aplicacion Angular 17 con Nx Monorepo, NgRx Signal Store y TailwindCSS.

## Stack

- **Angular 21** — Standalone components, signals API, control flow syntax
- **Nx 20** — Monorepo workspace con librerias compartidas
- **NgRx Signal Store** — Estado reactivo con `@ngrx/signals`
- **TailwindCSS 3.4** — Estilos con design tokens Kaufmann
- **Chart.js** — Graficos y visualizaciones
- **Lucide Angular** — Iconos
- **TypeScript 5.9** — Strict mode

## Inicio Rapido

```bash
npm install
npx nx serve tracking-otd     # http://localhost:4200
```

### Otros comandos

```bash
npx nx build tracking-otd          # Build produccion
npx nx test tracking-otd           # Tests unitarios
npx nx lint tracking-otd           # Linting
npx nx graph                       # Grafico de dependencias Nx
npm run affected:test              # Tests afectados por cambios
npm run affected:build             # Build afectado por cambios
```

## Estructura del Proyecto

```
kaufmann-workspace/
├── apps/
│   └── tracking-otd/              # Aplicacion principal
│       └── src/app/
│           ├── app.routes.ts      # Rutas con lazy loading
│           ├── app.component.ts   # Shell (sidebar + router-outlet)
│           └── core/              # Guards, interceptors, layout
│
├── libs/
│   ├── shared/                    # Librerias compartidas
│   │   ├── models/                # Interfaces TypeScript
│   │   ├── ui/                    # Componentes reutilizables
│   │   ├── utils/                 # Helpers y pipes
│   │   └── auth/                  # Guards y interceptors de auth
│   │
│   └── tracking-otd/              # Librerias del dominio
│       ├── data-access/           # Stores, servicios API, mock data
│       ├── feature-vin-tracking/  # Tracking principal de VINs
│       ├── feature-dashboard/     # Dashboard general
│       ├── feature-alertas/       # Alertas y notificaciones
│       ├── feature-analytics/     # Analitica y reportes
│       ├── feature-chat/          # Chat por ficha/VIN
│       ├── feature-staging/       # Importacion masiva
│       └── feature-admin/         # Panel de administracion
│
├── tailwind.config.js             # Design tokens Kaufmann
├── nx.json                        # Config Nx workspace
├── tsconfig.base.json             # Path aliases (@shared/*, @tracking-otd/*)
└── package.json
```

## Rutas

Todas las rutas de features usan **lazy loading** via `loadChildren`.

| Ruta                           | Feature Module          | Guard        |
|--------------------------------|-------------------------|--------------|
| `/login`                       | LoginComponent          | (publico)    |
| `/auth/microsoft/callback`     | AuthCallbackComponent   | (publico)    |
| `/tracking`                    | feature-vin-tracking    | `authGuard`  |
| `/dashboard`                   | feature-dashboard       | `authGuard`  |
| `/alertas`                     | feature-alertas         | `authGuard`  |
| `/analytics`                   | feature-analytics       | `authGuard`  |
| `/chat`                        | feature-chat            | `authGuard`  |
| `/staging`                     | feature-staging         | `authGuard`  |
| `/admin`                       | feature-admin           | `adminGuard` |

## Librerias

### Shared Models (`libs/shared/models/`)

Interfaces TypeScript que reflejan las entidades del backend:

| Modelo          | Archivo              | Descripcion                     |
|-----------------|----------------------|---------------------------------|
| `VinModel`      | `vin.model.ts`       | VIN con tracking y estados      |
| `HitoTracking`  | `hito.model.ts`      | Hito con subetapas              |
| `FichaModel`    | `ficha.model.ts`     | Ficha de venta                  |
| `AlertaModel`   | `alerta.model.ts`    | Alerta por SLA                  |
| `SlaConfigModel`| `sla-config.model.ts`| Configuracion SLA               |
| `ClienteModel`  | `cliente.model.ts`   | Cliente                         |
| `SubetapaModel` | `subetapa.model.ts`  | Subetapa con campo_staging      |

### Shared UI (`libs/shared/ui/`)

Componentes reutilizables con design tokens Kaufmann:

| Componente       | Descripcion                                       |
|------------------|---------------------------------------------------|
| `StatusBadge`    | Badge con color segun estado (a tiempo, demorado)  |
| `StageNode`      | Nodo circular para visualizar hito/subetapa        |
| `VehicleIcon`    | Icono por tipo de vehiculo (camion, bus, auto, maq)|
| `KpiCard`        | Tarjeta de KPI con titulo, valor y tendencia       |

### Shared Utils (`libs/shared/utils/`)

| Utilidad          | Descripcion                                      |
|-------------------|--------------------------------------------------|
| `date.helpers`    | Formateo y calculo de fechas                     |
| `sla.helpers`     | Calculo de estado SLA                            |
| Pipes             | Pipes personalizados para templates              |

### Data Access (`libs/tracking-otd/data-access/`)

| Elemento          | Descripcion                                      |
|-------------------|--------------------------------------------------|
| `TrackingStore`   | NgRx Signal Store para tracking de VINs          |
| `AlertasStore`    | Signal Store para alertas                        |
| Servicios API     | HttpClient wrappers para cada endpoint           |
| Mock data         | Datos de prueba para desarrollo sin backend      |

## Feature: VIN Tracking (`feature-vin-tracking`)

Feature principal del sistema. Componentes clave:

### Contenedores
- **`TrackingListPage`** — Lista de VINs con filtros, busqueda, vista agrupada/lista

### Componentes
- **`VisualMapComponent`** — Mapa visual swimlane del flujo de un VIN
  - Carril financiero (azul) y operativo (ambar)
  - Hitos como nodos circulares con estado visual
  - Click en hito abre drawer con detalle
- **`TrackingDrawer`** — Panel lateral con detalle de hito/subetapas
  - Muestra subetapas con fechas plan/real
  - Permite edicion de GAPs manuales

### Interaccion
```
Lista VINs → Click VIN → Visual Map (reemplaza vista)
                              → Click Hito → Drawer (detalle)
                              → Boton Volver → Lista VINs
```

## Feature: Admin (`feature-admin`)

Panel de administracion con 4 tabs:

| Tab               | Descripcion                                      |
|-------------------|--------------------------------------------------|
| Tipos de Vehiculo | CRUD de tipos de vehiculo                        |
| Hitos y Subetapas | Gestion de hitos maestros y subetapas            |
| Config por Tipo   | Editor swimlane + preview del proceso por tipo   |
| SLA               | Configuracion de SLAs por dimension              |

### Config por Tipo — Swimlane Editor
- Dos carriles: financiero y operativo
- Hitos agrupados en bloques por grupo paralelo
- Drag & drop para reordenar
- Grupo virtual trailing (sentinel `grupoId=0`) para crear nuevos grupos

## Design System

### Colores

| Token            | Hex       | Uso                      |
|------------------|-----------|--------------------------|
| `brand-navy`     | `#1E3A5F` | Headers, sidebar         |
| `brand-blue`     | `#2E75B6` | Acciones primarias       |
| `brand-light`    | `#EFF6FF` | Fondos claros            |
| `status-ontime`  | `#10b981` | Emerald — a tiempo       |
| `status-delayed` | `#ef4444` | Red — demorado           |
| `status-done`    | `#6b7280` | Slate — finalizado       |
| `status-pending` | `#94a3b8` | Gris — pendiente         |
| `status-active`  | `#3b82f6` | Blue — en progreso       |
| `status-warning` | `#f59e0b` | Amber — advertencia      |
| `line-vc`        | `#3b82f6` | Camiones/VC              |
| `line-autos`     | `#8b5cf6` | Vehiculos ligeros        |
| `line-maq`       | `#f97316` | Maquinaria               |

### Tipografia

| Token   | Font               |
|---------|--------------------|
| `sans`  | Plus Jakarta Sans  |
| `mono`  | JetBrains Mono     |

### Convenciones de Estilos
- Bordes: `border-slate-200`
- Fondos cards: `bg-white`
- Fondos pagina: `bg-slate-50`
- Sombras cards: `shadow-sm`
- Solo TailwindCSS — no SCSS custom

## Convenciones de Codigo

### Componentes
- Siempre **standalone** — nunca `NgModule`
- Control flow: `@for`, `@if`, `@switch` (no directivas estructurales legacy)
- Inputs: `input()` / `input.required<T>()`
- Outputs: `output<T>()`
- Estado local: `signal()`, `computed()`, `effect()`
- Imports explicitos en cada componente

### State Management
- NgRx Signal Store para estado global
- Signals para estado de componente
- Computed signals para derivaciones
- Effects para side effects

### Estructura de Features
```
feature-*/
├── src/
│   └── lib/
│       ├── containers/       # Smart components (conectados al store)
│       ├── components/       # Presentational components
│       └── routes.ts         # Rutas del feature module
└── index.ts                  # Barrel export
```

## Dependencias Principales

| Paquete              | Version  | Proposito                         |
|----------------------|----------|-----------------------------------|
| `@angular/core`      | 21.1.6   | Framework UI                      |
| `@ngrx/signals`      | ^21.0.1  | Signal Store (estado)             |
| `@angular/cdk`       | ^21.2.2  | Component Dev Kit                 |
| `chart.js`           | ^4.4.3   | Graficos                          |
| `lucide-angular`     | ^0.383.0 | Iconos                            |
| `xlsx`               | ^0.18.5  | Parsing/export Excel              |
| `rxjs`               | ~7.8.0   | Programacion reactiva             |
| `tailwindcss`        | ^3.4.3   | Framework CSS                     |
| `nx`                 | 20.8.4   | Workspace monorepo                |
