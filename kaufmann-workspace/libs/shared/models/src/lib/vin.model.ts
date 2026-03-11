import { HitoTracking } from './hito.model';

export type EstadoVin = 'A TIEMPO' | 'DEMORADO' | 'FINALIZADO';
export type LineaNegocio = 'VC' | 'Autos' | 'Maquinarias' | 'Buses' | 'Camiones';
export type TipoVehiculo = 'Camión' | 'Bus' | 'Maquinaria' | 'Vehículo Ligero' | 'Leasing';

export interface VinModel {
  id: string;
  fichaId: string;
  clientName: string;
  lineaNegocio: LineaNegocio;
  tipoVehiculo?: TipoVehiculo;
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
