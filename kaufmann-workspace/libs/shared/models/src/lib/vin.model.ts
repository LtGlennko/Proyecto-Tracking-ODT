import { HitoTracking } from './hito.model';

export type EstadoVin = 'A TIEMPO' | 'DEMORADO' | 'FINALIZADO';

export interface TipoVehiculoModel {
  id: number;
  nombre: string;
  color: string;
  icono?: string | null;
}

export interface VinModel {
  id: string;
  fichaId: string;
  clientName: string;
  isVic?: boolean;
  tipoVehiculo?: TipoVehiculoModel;
  modelo: string;
  lote: string;
  ordenCompra: string;
  formaPago: string;
  ejecutivo: string;
  estadoGeneral: EstadoVin;
  currentStageId: number | null;
  lastUpdate: string;
  daysDelayed: number;
  stages: HitoTracking[];
  diasVendedorComercial: number;
  cumplimiento: number;
}
