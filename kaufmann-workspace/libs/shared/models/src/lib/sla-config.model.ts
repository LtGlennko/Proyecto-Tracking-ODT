export interface SlaConfigModel {
  id: number;
  empresaId?: number;
  subetapaId?: number;
  tipoVehiculoId?: number;
  diasObjetivo: number;
  diasTolerancia: number;
}

export interface SlaContext {
  empresaId?: number;
  subetapaId?: number;
  tipoVehiculoId?: number;
}
