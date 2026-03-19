# Frontend — Angular Nx Workspace

## Stack
- Angular 17 (standalone components, signals API)
- Nx Monorepo (libs/, apps/)
- NgRx Signal Store (`@ngrx/signals`)
- TailwindCSS con design tokens Kaufmann
- TypeScript strict

## Paths Clave
- **App shell:** `apps/tracking-otd/src/app/` (routing, layout, guards)
- **Shared models:** `libs/shared/models/src/lib/` (VinModel, HitoTracking, FichaModel, AlertaModel, SlaConfigModel)
- **Shared UI:** `libs/shared/ui/src/lib/` (StatusBadge, StageNode, VehicleIcon, KpiCard)
- **Shared utils:** `libs/shared/utils/src/lib/` (date.helpers, sla.helpers, pipes)
- **Data access:** `libs/tracking-otd/data-access/src/lib/` (TrackingStore, AlertasStore, mock data)
- **Features:** `libs/tracking-otd/feature-*/` (feature-vin-tracking, feature-admin, feature-dashboard, feature-alertas)

## Reglas Obligatorias
- SIEMPRE standalone components — NUNCA NgModule
- Control flow: `@for`, `@if`, `@switch` (no `*ngFor`, `*ngIf`)
- Inputs con `input()` / `input.required<T>()`, outputs con `output<T>()`
- State con `signal()`, `computed()`, `effect()`
- Imports explícitos en cada componente
- Estilos SOLO con TailwindCSS — no SCSS custom, no `styles:[]` en componentes
- Reutilizar componentes de `libs/shared/ui/` antes de crear nuevos
- Barrel exports en cada `index.ts` de librería

## Design System
- **Brand navy:** `#1E3A5F` | **Brand blue:** `#2E75B6`
- **Status colors:** emerald = A TIEMPO, red = DEMORADO, slate = FINALIZADO, blue = ACTIVO
- **Líneas de negocio:** blue = VC/Camiones, purple = Autos, orange = Maquinarias, sky = Buses
- **Font:** Plus Jakarta Sans
- **Bordes:** `border-slate-200`, **Fondos:** `bg-white`, `bg-slate-50`
- **Sombras:** `shadow-sm` para cards

## Módulo Admin (`feature-admin`)
Página con 5 tabs: **Tipos de Vehículo**, **Hitos y Subetapas**, **Config por Tipo**, **SLA**, **Mapeo Campos**.
- "Hitos Maestros" y "Mapeo Campos" son superadmin-only (estilo rojo + icono lock).

### Config por Tipo — Componentes clave:
- **`HitoConfigSwimlaneComponent`** — Editor visual de hitos por tipo de vehículo
  - Dos carriles: financiero (azul) y operativo (ámbar)
  - Hitos agrupados en bloques por `grupoParalelo`
  - Grupo virtual trailing (`grupoId=0`): siempre aparece al final, no ordenable, no eliminable
  - Al asignar un hito al grupo virtual → frontend llama POST para crear grupo real
  - Al vaciar un grupo no-último → frontend llama DELETE para eliminarlo
  - Selector de grupo por hito (sin opción "Sin grupo")
  - Orden y activación de hitos y subetapas por drag/toggle
- **`ProcessPreviewComponent`** — Vista previa del proceso configurado
  - Toggle Editor/Vista previa en la tab Config por Tipo
  - Layout swimlane: carril financiero (arriba) + carril operativo (abajo)
  - Separadores verticales dashed entre grupos paralelos (continuo, no partido)
  - Flechas solo entre hitos del mismo carril/grupo
  - Solo muestra hitos y subetapas activos
  - Filtra grupos sin hitos activos

### Patrón Grupo Virtual Trailing
```
grupoId=0 → sentinel "nuevo grupo"
Frontend: handleChangeGrupo(hc, grupoId)
  Si grupoId === 0 → POST /v1/hitos/grupos-paralelos → obtener ID real
  PATCH /v1/hitos/config/{tipo}/hito/{hitoId} con grupoParaleloId
  Si grupo anterior quedó vacío → DELETE /v1/hitos/grupos-paralelos/{id}
```

### Hitos y Subetapas tab:
- Icon picker para hitos (iconos Lucide)
- Dos columnas separadas: "Campo Fecha Plan" / "Campo Fecha Real"

### SLA tab:
- Detección de duplicados con opción de actualizar

### Mapeo Campos tab (superadmin-only):
- Drag-drop para reordenar prioridad
- Filtros por tipo de vehículo y cantidad de fuentes
- Columnas staging desde API

## Módulo Vin Tracking (`feature-vin-tracking`)
- **`VisualMapComponent`** — Mapa visual (label: "Flujo") de hitos para un VIN específico
  - Flujo principal (mainFlow) + flujo paralelo (parallelFlow)
  - Usa `StageNodeComponent` de shared/ui
  - Estados: completed (emerald), delayed (red), active (blue), pending (slate)
  - Hover cards en vez de listas de subetapas, fecha de última subetapa bajo el nombre del icono
- **Tracking List** — Lucide icons en círculos de hitos, hover cards en vez de tooltips
- **Gantt** — Scrollbar horizontal para evitar superposición de etiquetas de fecha
- **Filtros** — Persisten al navegar a/desde detalle VIN (ngModel binding)
- **UI Labels:** "Seguimiento ODT" como título, "Tracking Detalle" en vista detalle

## Datos Dinámicos (sin hardcoding)
- Tipos de vehículo: desde API via `TipoVehiculoService`
- Columnas staging: desde API
- Nombres/IDs de hitos: desde BD (`hito.nombre`, `hito.id`)
- `HitoTracking.id` es `number` (era `string`)
- `ficha.formasPago: string[]` reemplaza `ficha.formaPago: string`

## Iconos
- Lucide icons registrados globalmente en `app.config`
- Usados en: tracking list, visual map, process preview

## Verificación
```bash
npx nx serve tracking-otd    # Dev server
npx nx build tracking-otd    # Production build
npx nx lint tracking-otd     # Linting
```
