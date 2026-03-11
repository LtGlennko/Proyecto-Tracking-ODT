import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { AlertaModel, EstadoAlerta, SeveridadAlerta } from '@kaufmann/shared/models';
import { MOCK_ALERTAS } from '../mock/mock-alertas.data';

type AlertasState = {
  alertas: AlertaModel[];
  filtroSeveridad: SeveridadAlerta | null;
  filtroEstado: EstadoAlerta | null;
  filtroArea: string | null;
};

export const AlertasStore = signalStore(
  { providedIn: 'root' },
  withState<AlertasState>({
    alertas: MOCK_ALERTAS,
    filtroSeveridad: null,
    filtroEstado: null,
    filtroArea: null,
  }),

  withComputed(({ alertas, filtroSeveridad, filtroEstado, filtroArea }) => ({
    alertasFiltradas: computed(() =>
      alertas().filter(a => {
        if (filtroSeveridad() && a.severity !== filtroSeveridad()) return false;
        if (filtroEstado() && a.status !== filtroEstado()) return false;
        if (filtroArea() && a.responsibleArea !== filtroArea()) return false;
        return true;
      })
    ),
    totalCriticas: computed(() => alertas().filter(a => a.nivel === 'critico' && a.status !== 'resolved').length),
    totalAdvertencias: computed(() => alertas().filter(a => a.nivel === 'advertencia' && a.status !== 'resolved').length),
    totalResueltas: computed(() => alertas().filter(a => a.status === 'resolved').length),
  })),

  withMethods((store) => ({
    updateStatus(id: string, status: EstadoAlerta) {
      patchState(store, {
        alertas: store.alertas().map(a => a.id === id ? { ...a, status } : a),
      });
    },
    setFiltro(key: keyof Pick<AlertasState, 'filtroSeveridad' | 'filtroEstado' | 'filtroArea'>, value: unknown) {
      patchState(store, { [key]: value });
    },
  }))
);
