/**
 * Centralized status-to-CSS-class mapping helpers.
 * Used by tracking-list-page, visual-map, and other components
 * that display hito/substatus badges with design-token classes.
 */

/** Stage-level status → display label */
export function stageStatusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Completado';
    case 'delayed': return 'Demorado';
    case 'active': return 'En curso';
    default: return 'Pendiente';
  }
}

/** Stage-level status → label badge CSS (text + bg) */
export function stageStatusLabelClass(status: string): string {
  switch (status) {
    case 'completed': return 'text-st-ontime bg-st-ontime-light';
    case 'delayed': return 'text-st-delayed bg-st-delayed-light';
    case 'active': return 'text-st-active bg-st-active-light';
    default: return 'text-st-pending bg-st-pending-light';
  }
}

/** Substatus → display label */
export function subStatusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'A tiempo';
    case 'completed-risk': return 'En tolerancia';
    case 'completed-late': return 'Crítico';
    case 'on-time': return 'A tiempo';
    case 'at-risk': return 'En tolerancia';
    case 'delayed': return 'Crítico';
    default: return 'Pendiente';
  }
}

/** Substatus → badge CSS (bg + text) */
export function subStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-st-ontime-light text-st-ontime';
    case 'completed-risk': return 'bg-st-risk-light text-st-risk';
    case 'completed-late': return 'bg-st-delayed-light text-st-delayed';
    case 'on-time': return 'bg-st-pending-light text-st-pending';
    case 'at-risk': return 'bg-st-risk-light text-st-risk';
    case 'delayed': return 'bg-st-delayed-light text-st-delayed';
    default: return 'bg-st-pending-light text-st-pending';
  }
}

/** Hito dot/circle CSS for tracking list (includes border-2) */
export function hitoDotClass(status: string): string {
  switch (status) {
    case 'completed': return 'border-2 border-st-ontime bg-st-ontime-light text-st-ontime';
    case 'delayed':   return 'border-2 border-st-delayed bg-st-delayed-light text-st-delayed animate-pulse';
    case 'active':    return 'border-2 border-st-active bg-st-active-light text-st-active animate-pulse';
    default:          return 'border-2 border-st-pending bg-st-pending-light text-st-pending';
  }
}

/** Hito circle CSS for visual map (without border-2, since parent element provides it) */
export function hitoCircleClass(status: string): string {
  if (status === 'completed') return 'border-st-ontime bg-st-ontime-light text-st-ontime';
  if (status === 'delayed') return 'border-st-delayed bg-st-delayed-light text-st-delayed';
  if (status === 'active') return 'border-st-active bg-st-active-light text-st-active animate-pulse';
  return 'border-st-pending bg-st-pending-light text-st-pending';
}

/** Substatus → dot color CSS */
export function subDotClass(status: string): string {
  if (status === 'completed') return 'bg-st-ontime';
  if (status === 'completed-risk') return 'bg-st-risk';
  if (status === 'completed-late') return 'bg-st-delayed';
  if (status === 'at-risk') return 'bg-st-risk animate-pulse';
  if (status === 'delayed') return 'bg-st-delayed animate-pulse';
  return 'bg-st-pending';
}

/** Hito status pill CSS (bg + text + border) for drawer hito header */
export function hitoStatusPillClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-st-ontime-light text-st-ontime border border-st-ontime-border';
    case 'delayed':   return 'bg-st-delayed-light text-st-delayed border border-st-delayed-border';
    case 'active':    return 'bg-st-active-light text-st-active border border-st-active-border';
    default:          return 'bg-st-pending-light text-st-pending border border-st-pending-border';
  }
}

/** Progress bar fill color for hito detail */
export function progressBarColor(status: string): string {
  if (status === 'delayed')   return 'bg-st-delayed';
  if (status === 'completed') return 'bg-st-ontime';
  if (status === 'active')    return 'bg-st-active';
  return 'bg-st-pending-border';
}

/** Tramo pair status background+text for drawer tramos tab */
export function tramoPairClass(status: string): string {
  switch (status) {
    case 'on-time': return 'bg-st-ontime-light text-st-ontime';
    case 'at-risk':  return 'bg-st-risk-light text-st-risk';
    case 'delayed':  return 'bg-st-delayed-light text-st-delayed';
    default:         return 'bg-st-pending-light text-st-pending';
  }
}
