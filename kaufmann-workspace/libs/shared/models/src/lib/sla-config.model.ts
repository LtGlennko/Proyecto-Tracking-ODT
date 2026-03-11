import { LineaNegocio, TipoVehiculo } from './vin.model';

export interface SlaConfigModel {
  id: number;
  empresaId?: number;
  subetapaId?: number;
  lineaNegocio?: LineaNegocio;
  tipoVehiculo?: TipoVehiculo;
  diasObjetivo: number;
  diasTolerancia: number;
}

export interface SlaContext {
  empresaId?: number;
  subetapaId?: number;
  lineaNegocio?: LineaNegocio;
  tipoVehiculo?: TipoVehiculo;
}
