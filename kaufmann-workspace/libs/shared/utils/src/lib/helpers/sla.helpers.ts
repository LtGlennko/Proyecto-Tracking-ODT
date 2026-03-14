import { SlaConfigModel, SlaContext } from '@kaufmann/shared/models';

function countDimensions(config: SlaConfigModel): number {
  let count = 0;
  if (config.empresaId != null) count++;
  if (config.subetapaId != null) count++;
  if (config.tipoVehiculoId != null) count++;
  return count;
}

function matches(config: SlaConfigModel, context: SlaContext): boolean {
  if (config.empresaId != null && config.empresaId !== context.empresaId) return false;
  if (config.subetapaId != null && config.subetapaId !== context.subetapaId) return false;
  if (config.tipoVehiculoId != null && config.tipoVehiculoId !== context.tipoVehiculoId) return false;
  return true;
}

export function resolveSla(configs: SlaConfigModel[], context: SlaContext): SlaConfigModel | null {
  const matching = configs.filter(c => matches(c, context));
  if (matching.length === 0) return null;
  return matching.reduce((best, curr) =>
    countDimensions(curr) > countDimensions(best) ? curr : best
  );
}

export function getSlaStatus(dias: number, sla: SlaConfigModel): 'ok' | 'warning' | 'critico' {
  if (dias <= sla.diasObjetivo) return 'ok';
  if (dias <= sla.diasObjetivo + sla.diasTolerancia) return 'warning';
  return 'critico';
}
