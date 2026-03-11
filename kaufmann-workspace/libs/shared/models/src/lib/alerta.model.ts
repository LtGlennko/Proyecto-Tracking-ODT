export type SeveridadAlerta = 'high' | 'medium' | 'low';
export type EstadoAlerta = 'action_required' | 'read' | 'resolved';
export type NivelAlerta = 'critico' | 'advertencia';

export interface AlertaModel {
  id: string;
  vinId: string;
  fichaId: string;
  clientName: string;
  modelo: string;
  stageName: string;
  subStageName: string;
  responsibleArea: string;
  prevDate: string;
  newDate: string;
  delayDays: number;
  severity: SeveridadAlerta;
  nivel: NivelAlerta;
  timestamp: string;
  status: EstadoAlerta;
}
