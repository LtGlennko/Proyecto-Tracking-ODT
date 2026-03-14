export type EstadoHito = 'pending' | 'active' | 'completed' | 'delayed';
export type CategoriaSubetapa = 'COMEX' | 'LOGISTICA' | 'COMERCIAL' | 'TALLER';
export type CarrilHito = 'financiero' | 'operativo';

export interface DateSet {
  start: string | null;
  end: string | null;
}

export interface SubetapaTracking {
  id: string;
  name: string;
  category: CategoriaSubetapa;
  baseline: DateSet;
  plan: DateSet;
  real: DateSet;
  status: 'pending' | 'active' | 'completed';
  notes?: string;
}

export interface HitoTracking {
  id: string;
  name: string;
  carril?: CarrilHito;
  status: EstadoHito;
  isParallel?: boolean;
  grupoParaleloId?: number | null;
  baseline: DateSet;
  plan: DateSet;
  real: DateSet;
  subStages: SubetapaTracking[];
}

export const HITOS_IDS = [
  'importacion', 'asignacion', 'pdi',
  'credito', 'facturacion', 'pago',
  'inmatriculacion', 'programacion', 'entrega'
] as const;

export type HitoId = typeof HITOS_IDS[number];

export const HITO_LABELS: Record<string, string> = {
  'importacion':     'Importación',
  'asignacion':      'Asignación',
  'pdi':             'PDI',
  'credito':         'Crédito',
  'facturacion':     'Facturación',
  'pago':            'Pago',
  'inmatriculacion': 'Inmatr.',
  'programacion':    'Prog.',
  'entrega':         'Entrega'
};
