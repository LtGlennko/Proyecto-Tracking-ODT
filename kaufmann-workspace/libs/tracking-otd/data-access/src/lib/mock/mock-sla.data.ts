import { SlaConfigModel } from '@kaufmann/shared/models';

export const MOCK_SLA_CONFIGS: SlaConfigModel[] = [
  // Regla genérica para todas las empresas
  { id: 1, diasObjetivo: 30, diasTolerancia: 5 },
  // Específica para VC
  { id: 2, lineaNegocio: 'VC', diasObjetivo: 35, diasTolerancia: 7 },
  // Específica para Maquinarias
  { id: 3, lineaNegocio: 'Maquinarias', diasObjetivo: 45, diasTolerancia: 10 },
  // Específica para Autos
  { id: 4, lineaNegocio: 'Autos', diasObjetivo: 25, diasTolerancia: 5 },
  // Específica para Buses
  { id: 5, lineaNegocio: 'Buses', diasObjetivo: 40, diasTolerancia: 8 },
  // Regla empresa 1 (Divemotor) para Camiones
  { id: 6, empresaId: 1, tipoVehiculo: 'Camión', diasObjetivo: 32, diasTolerancia: 6 },
];
