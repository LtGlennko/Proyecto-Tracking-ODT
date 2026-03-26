import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { AlertaModel, EstadoAlerta, SeveridadAlerta, MencionModel } from '@kaufmann/shared/models';

const MOCK_ALERTAS: AlertaModel[] = [
  {
    id: '1',
    vinId: 'WDB-9988776655',
    fichaId: 'F-001',
    clientName: 'Transportes del Norte S.A.',
    modelo: 'Mercedes-Benz Actros 2651',
    stageName: 'PDI',
    subStageName: 'Inspección técnica',
    responsibleArea: 'Servicios Logísticos / Taller',
    prevDate: '2023-10-10',
    newDate: '2023-10-14',
    delayDays: 4,
    severity: 'high',
    nivel: 'critico',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: 'action_required',
  },
  {
    id: '2',
    vinId: 'CAT-EXC-330',
    fichaId: 'F-002',
    clientName: 'Minera Aurífera del Sur',
    modelo: 'Excavadora CAT 330 GC',
    stageName: 'PDI',
    subStageName: 'Revisión hidráulica',
    responsibleArea: 'Taller Maquinaria',
    prevDate: '2023-10-12',
    newDate: '2023-10-15',
    delayDays: 3,
    severity: 'medium',
    nivel: 'advertencia',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: 'action_required',
  },
  {
    id: '3',
    vinId: 'JEEP-ABC-12345',
    fichaId: 'F-003',
    clientName: 'Renting Corporativo S.A.C.',
    modelo: 'Jeep Commander',
    stageName: 'Crédito',
    subStageName: 'Aprobación crédito',
    responsibleArea: 'Área Comercial / Créditos',
    prevDate: '2023-10-11',
    newDate: '2023-10-13',
    delayDays: 2,
    severity: 'medium',
    nivel: 'advertencia',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    status: 'read',
  },
];

const MOCK_MENCIONES: MencionModel[] = [
  {
    id: 'm1',
    vinId: 'WDB-9988776655',
    mensaje: '@Juan Administrativo favor revisar estatus de aduana.',
    autor: 'Carlos Operaciones',
    fecha: new Date(Date.now() - 18 * 3600000).toISOString(),
    leida: false,
  },
];

type AlertasState = {
  alertas: AlertaModel[];
  menciones: MencionModel[];
  selectedAlertaId: string | null;
  filtroSeveridad: SeveridadAlerta | null;
  filtroEstado: EstadoAlerta | null;
  filtroArea: string | null;
};

export const AlertasStore = signalStore(
  { providedIn: 'root' },
  withState<AlertasState>({
    alertas: MOCK_ALERTAS,
    menciones: MOCK_MENCIONES,
    selectedAlertaId: '1',
    filtroSeveridad: null,
    filtroEstado: null,
    filtroArea: null,
  }),

  withComputed(({ alertas, menciones, filtroSeveridad, filtroEstado, filtroArea, selectedAlertaId }) => ({
    alertasFiltradas: computed(() =>
      alertas().filter(a => {
        if (filtroSeveridad() && a.severity !== filtroSeveridad()) return false;
        if (filtroEstado() && a.status !== filtroEstado()) return false;
        if (filtroArea() && a.responsibleArea !== filtroArea()) return false;
        return true;
      })
    ),
    selectedAlerta: computed(() => alertas().find(a => a.id === selectedAlertaId()) ?? null),
    totalCriticas: computed(() => alertas().filter(a => a.nivel === 'critico' && a.status !== 'resolved').length),
    totalAdvertencias: computed(() => alertas().filter(a => a.nivel === 'advertencia' && a.status !== 'resolved').length),
    totalResueltas: computed(() => alertas().filter(a => a.status === 'resolved').length),
    totalAlertasNoLeidas: computed(() => alertas().filter(a => a.status === 'action_required').length),
    totalMencionesNoLeidas: computed(() => menciones().filter(m => !m.leida).length),
  })),

  withMethods((store) => ({
    selectAlerta(id: string) {
      patchState(store, { selectedAlertaId: id });
    },
    updateStatus(id: string, status: EstadoAlerta) {
      patchState(store, {
        alertas: store.alertas().map(a => a.id === id ? { ...a, status } : a),
      });
    },
    markAllAlertasRead() {
      patchState(store, {
        alertas: store.alertas().map(a => a.status === 'action_required' ? { ...a, status: 'read' as EstadoAlerta } : a),
      });
    },
    markAllMencionesRead() {
      patchState(store, {
        menciones: store.menciones().map(m => ({ ...m, leida: true })),
      });
    },
    setFiltro(key: keyof Pick<AlertasState, 'filtroSeveridad' | 'filtroEstado' | 'filtroArea'>, value: unknown) {
      patchState(store, { [key]: value });
    },
  }))
);
