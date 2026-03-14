import { SlaConfigModel } from '@kaufmann/shared/models';

export const MOCK_SLA_CONFIGS: SlaConfigModel[] = [
  // Regla genérica para todas las empresas
  { id: 1, diasObjetivo: 30, diasTolerancia: 5 },
  // Específica para Camiones (tipoVehiculoId=1)
  { id: 2, tipoVehiculoId: 1, diasObjetivo: 35, diasTolerancia: 7 },
  // Específica para Maquinaria (tipoVehiculoId=3)
  { id: 3, tipoVehiculoId: 3, diasObjetivo: 45, diasTolerancia: 10 },
  // Específica para Vehículo Ligero (tipoVehiculoId=4)
  { id: 4, tipoVehiculoId: 4, diasObjetivo: 25, diasTolerancia: 5 },
  // Específica para Buses (tipoVehiculoId=2)
  { id: 5, tipoVehiculoId: 2, diasObjetivo: 40, diasTolerancia: 8 },
  // Regla empresa 1 (Divemotor) para Camiones
  { id: 6, empresaId: 1, tipoVehiculoId: 1, diasObjetivo: 32, diasTolerancia: 6 },
];
