export type EstadoHito = 'pending' | 'active' | 'completed' | 'delayed';
export type CarrilHito = 'financiero' | 'operativo';

export interface DateSet {
  start: string | null;
  end: string | null;
}

export interface SubetapaTracking {
  id: string;
  name: string;
  baseline: DateSet;
  plan: DateSet;
  real: DateSet;
  status: 'on-time' | 'at-risk' | 'delayed' | 'completed' | 'completed-risk' | 'completed-late';
  notes?: string;
}

export interface HitoTracking {
  id: number;
  name: string;
  icono?: string | null;
  carril?: CarrilHito;
  status: EstadoHito;
  isParallel?: boolean;
  grupoParaleloId?: number | null;
  baseline: DateSet;
  plan: DateSet;
  real: DateSet;
  subStages: SubetapaTracking[];
}

