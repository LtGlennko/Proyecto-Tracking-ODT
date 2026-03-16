import { HitoTracking, SubetapaTracking } from '@kaufmann/shared/models';

export function addDays(baseDate: string, days: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function createImportacion(startDate: string, status: HitoTracking['status'], tipoVehiculoSlug?: string): HitoTracking {
  const isBus = tipoVehiculoSlug === 'bus';
  const offset = isBus ? 5 : 0;
  const endBaseline = addDays(startDate, 30 + offset);
  const endReal = status === 'delayed' ? addDays(startDate, 38 + offset) : addDays(startDate, 29 + offset);

  const subStages: SubetapaTracking[] = [
    { id: 'imp-1', name: 'Solicitud negocio', baseline: { start: startDate, end: startDate }, plan: { start: startDate, end: startDate }, real: { start: startDate, end: startDate }, status: 'completed' },
    { id: 'imp-2', name: 'Pedido fábrica', baseline: { start: addDays(startDate, 2), end: addDays(startDate, 2) }, plan: { start: addDays(startDate, 2), end: addDays(startDate, 2) }, real: { start: addDays(startDate, 2), end: addDays(startDate, 2) }, status: 'completed' },
    { id: 'imp-3', name: 'Producción', baseline: { start: addDays(startDate, 5), end: addDays(startDate, 15) }, plan: { start: addDays(startDate, 5), end: addDays(startDate, 15) }, real: { start: addDays(startDate, 5), end: addDays(startDate, 15) }, status: 'completed' },
  ];
  if (isBus) {
    subStages.push({ id: 'imp-bus-1', name: 'Carrocero Internacional', baseline: { start: addDays(startDate, 15), end: addDays(startDate, 20) }, plan: { start: addDays(startDate, 15), end: addDays(startDate, 20) }, real: { start: addDays(startDate, 15), end: addDays(startDate, 20) }, status: 'completed' });
  }
  const embarqueDay = 16 + offset;
  subStages.push(
    { id: 'imp-4', name: 'Embarque', baseline: { start: addDays(startDate, embarqueDay), end: addDays(startDate, embarqueDay) }, plan: { start: addDays(startDate, embarqueDay), end: addDays(startDate, embarqueDay) }, real: { start: addDays(startDate, embarqueDay), end: addDays(startDate, embarqueDay) }, status: 'completed' },
    { id: 'imp-5', name: 'En aduana', baseline: { start: addDays(startDate, 25 + offset), end: addDays(startDate, 27 + offset) }, plan: { start: addDays(startDate, 25 + offset), end: addDays(startDate, 27 + offset) }, real: { start: addDays(startDate, 25 + offset), end: addDays(startDate, 28 + offset) }, status: 'completed' },
    { id: 'imp-6', name: 'En almacén', baseline: { start: endBaseline, end: endBaseline }, plan: { start: endBaseline, end: endBaseline }, real: { start: endReal, end: endReal }, status: status === 'completed' ? 'completed' : 'active' }
  );
  return { id: 'importacion', name: 'Importación', status, baseline: { start: startDate, end: endBaseline }, plan: { start: startDate, end: endBaseline }, real: { start: startDate, end: endReal }, subStages };
}

function createAsignacion(prevEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(prevEnd, 1);
  const end = addDays(start, 2);
  return {
    id: 'asignacion', name: 'Asignación', status,
    baseline: { start, end }, plan: { start, end }, real: { start, end: status === 'completed' ? end : addDays(end, 1) },
    subStages: [
      { id: 'asg-1', name: 'Reserva', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: 'completed' },
      { id: 'asg-2', name: 'Asig. Definitiva', baseline: { start: end, end }, plan: { start: end, end }, real: { start: end, end }, status: status === 'completed' ? 'completed' : 'pending' },
    ]
  };
}

function createCredito(prevEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(prevEnd, 1);
  const end = addDays(start, 5);
  return {
    id: 'credito', name: 'Crédito', status,
    baseline: { start, end }, plan: { start, end }, real: { start, end: status === 'delayed' ? addDays(end, 3) : end },
    subStages: [
      { id: 'cre-1', name: 'Solicitud crédito', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: 'completed' },
      { id: 'cre-2', name: 'Aprobación', baseline: { start: addDays(start, 2), end: addDays(start, 3) }, plan: { start: addDays(start, 2), end: addDays(start, 3) }, real: { start: addDays(start, 2), end: addDays(start, 3) }, status: status === 'completed' ? 'completed' : 'active' },
    ]
  };
}

function createFacturacion(prevEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(prevEnd, 1);
  return {
    id: 'facturacion', name: 'Facturación', status,
    baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start },
    subStages: [{ id: 'fac-1', name: 'Emisión Factura', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: status === 'completed' ? 'completed' : 'pending' }]
  };
}

function createPago(prevEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(prevEnd, 1);
  return {
    id: 'pago', name: 'Pago', status,
    baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start },
    subStages: [{ id: 'pay-1', name: 'Pago Confirmado', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: status === 'completed' ? 'completed' : 'pending' }]
  };
}

function createPDI(asignacionEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(asignacionEnd, 1);
  const end = addDays(start, 10);
  return {
    id: 'pdi', name: 'PDI', status, isParallel: true,
    baseline: { start, end }, plan: { start, end }, real: { start, end: status === 'delayed' ? addDays(end, 5) : end },
    subStages: [
      { id: 'pdi-1', name: 'Inicio PDI', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: 'completed' },
      { id: 'pdi-2', name: 'En Carrocero Local', baseline: { start: addDays(start, 2), end: addDays(start, 6) }, plan: { start: addDays(start, 2), end: addDays(start, 6) }, real: { start: addDays(start, 2), end: addDays(start, 6) }, status: status === 'completed' ? 'completed' : 'active' },
      { id: 'pdi-3', name: 'Salida PDI', baseline: { start: end, end }, plan: { start: end, end }, real: { start: end, end }, status: 'pending' },
    ]
  };
}

function createInmatriculacion(prevEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(prevEnd, 1);
  const end = addDays(start, 5);
  return {
    id: 'inmatriculacion', name: 'Inmatriculación', status,
    baseline: { start, end }, plan: { start, end }, real: { start, end },
    subStages: [
      { id: 'inm-1', name: 'Inicio trámite', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: status === 'completed' ? 'completed' : 'active' },
      { id: 'inm-2', name: 'Placas recibidas', baseline: { start: end, end }, plan: { start: end, end }, real: { start: end, end }, status: status === 'completed' ? 'completed' : 'pending' },
    ]
  };
}

function createProgramacion(inmatrEnd: string, pdiEnd: string, status: HitoTracking['status']): HitoTracking {
  const d1 = new Date(inmatrEnd);
  const d2 = new Date(pdiEnd);
  const maxDate = d1 > d2 ? inmatrEnd : pdiEnd;
  const start = addDays(maxDate, 1);
  return {
    id: 'programacion', name: 'Programación', status,
    baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start },
    subStages: [
      { id: 'prg-1', name: 'Unidad Lista', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: 'pending' },
      { id: 'prg-2', name: 'Cita Agendada', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: 'pending' },
    ]
  };
}

function createEntrega(progEnd: string, status: HitoTracking['status']): HitoTracking {
  const start = addDays(progEnd, 1);
  return {
    id: 'entrega', name: 'Entrega', status,
    baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start },
    subStages: [{ id: 'ent-1', name: 'Entregado al Cliente', baseline: { start, end: start }, plan: { start, end: start }, real: { start, end: start }, status: 'pending' }]
  };
}

export function generateStages(startDate: string, scenario: 'ontime' | 'delayed', tipoVehiculoSlug: string): HitoTracking[] {
  const s1 = createImportacion(startDate, 'completed', tipoVehiculoSlug);
  const s2 = createAsignacion(s1.real.end!, 'completed');
  const sPDI = createPDI(s2.real.end!, scenario === 'delayed' ? 'delayed' : 'active');
  const s3 = createCredito(s2.real.end!, 'completed');
  const s4 = createFacturacion(s3.real.end!, scenario === 'delayed' ? 'active' : 'completed');
  const s5 = createPago(s4.real.end!, scenario === 'delayed' ? 'pending' : 'completed');
  const s6 = createInmatriculacion(s5.real.end!, scenario === 'delayed' ? 'pending' : 'active');
  const s7 = createProgramacion(s6.plan.end!, sPDI.plan.end!, 'pending');
  const s8 = createEntrega(s7.plan.end!, 'pending');
  return [s1, s2, sPDI, s3, s4, s5, s6, s7, s8];
}
