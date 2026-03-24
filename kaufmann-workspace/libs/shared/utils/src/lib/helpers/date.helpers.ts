const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_ES[d.getUTCMonth()];
  const year = String(d.getUTCFullYear()).slice(2);
  return `${day} ${month} ${year}`;
}

export function calculateDiff(date1: string | null, date2: string | null): number {
  if (!date1 || !date2) return 0;
  const a = new Date(date1).getTime();
  const b = new Date(date2).getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.ceil((a - b) / (1000 * 60 * 60 * 24));
}

export function isDateOverdue(planEnd: string | null, realEnd: string | null): boolean {
  if (!planEnd || !realEnd) return false;
  return calculateDiff(realEnd, planEnd) > 2;
}

export function relativeDate(dateStr: string): string {
  if (!dateStr) return '-';
  const now = new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `Hace ${diffHrs} hora${diffHrs > 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 14) return 'Hace 1 semana';
  return formatDate(dateStr);
}

export function addDays(baseDate: string, days: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export interface DateSet {
  start: string | null;
  end: string | null;
}

export interface SubFechaResult {
  text: string;
  esPlan: boolean;
  raw: string;
}

/**
 * Resolves the display date for a subetapa.
 * Priority: real.end > real.start > plan.end > plan.start
 * Returns formatted text, whether it's plan, and the raw ISO date.
 */
export function resolveSubFecha(
  real: DateSet | null | undefined,
  plan: DateSet | null | undefined,
): SubFechaResult {
  const realDate = real?.end || real?.start || '';
  const planDate = plan?.end || plan?.start || '';
  if (realDate) return { text: formatDate(realDate), esPlan: false, raw: realDate };
  if (planDate) return { text: formatDate(planDate), esPlan: true, raw: planDate };
  return { text: '', esPlan: false, raw: '' };
}
