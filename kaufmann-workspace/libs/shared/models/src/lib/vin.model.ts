import { HitoTracking } from './hito.model';

export type EstadoVin = 'A TIEMPO' | 'DEMORADO' | 'FINALIZADO';

export interface TipoVehiculoModel {
  id: number;
  nombre: string;
  slug: string;
  color: string;
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
  estadoGeneral: EstadoVin;
  currentStageId: string;
  lastUpdate: string;
  daysDelayed: number;
  stages: HitoTracking[];
  diasVendedorComercial: number;
  cumplimiento: number;
}
