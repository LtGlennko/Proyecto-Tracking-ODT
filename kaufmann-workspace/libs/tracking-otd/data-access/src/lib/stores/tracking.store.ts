import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { VinModel, EstadoVin, LineaNegocio, ClienteModel } from '@kaufmann/shared/models';
import { EmpresaFilterService } from '@kaufmann/shared/auth';
import { MOCK_CLIENTS } from '../mock/mock-clients.data';

type FiltrosTracking = {
  lineaNegocio: LineaNegocio | null;
  estado: EstadoVin | null;
  hitoActual: string | null;
  busqueda: string;
};

type TrackingState = {
  clientes: ClienteModel[];
  vins: VinModel[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosTracking;
  selectedVinId: string | null;
  drawerOpen: boolean;
  selectedStageId: string | null;
  viewMode: 'grouped' | 'list';
};

const allVins = MOCK_CLIENTS.flatMap(c => c.fichas.flatMap(f => f.vins));

const initialState: TrackingState = {
  clientes: MOCK_CLIENTS,
  vins: allVins,
  loading: false,
  error: null,
  filtros: { lineaNegocio: null, estado: null, hitoActual: null, busqueda: '' },
  selectedVinId: null,
  drawerOpen: false,
  selectedStageId: null,
  viewMode: 'grouped',
};

export const TrackingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ vins, filtros, selectedVinId, clientes }) => {
    const empresaFilter = inject(EmpresaFilterService);

    return {
      vinsFiltrados: computed(() => {
        const f = filtros();
        const selectedEmpresaNombre = empresaFilter.selectedEmpresaNombre();

        return vins().filter(v => {
          if (f.estado && v.estadoGeneral !== f.estado) return false;
          if (f.lineaNegocio && v.lineaNegocio !== f.lineaNegocio) return false;
          if (selectedEmpresaNombre) {
            const client = clientes().find(c => c.fichas.some(fi => fi.vins.some(vi => vi.id === v.id)));
            if (client?.empresa !== selectedEmpresaNombre) return false;
          }
          if (f.hitoActual && v.currentStageId !== f.hitoActual) return false;
          if (f.busqueda) {
            const q = f.busqueda.toLowerCase();
            return (
              v.id.toLowerCase().includes(q) ||
              v.clientName.toLowerCase().includes(q) ||
              v.modelo.toLowerCase().includes(q) ||
              v.fichaId.toLowerCase().includes(q)
            );
          }
          return true;
        });
      }),

      totalDemorados: computed(() => vins().filter(v => v.estadoGeneral === 'DEMORADO').length),
      totalActivos: computed(() => vins().filter(v => v.estadoGeneral !== 'FINALIZADO').length),
      totalFinalizados: computed(() => vins().filter(v => v.estadoGeneral === 'FINALIZADO').length),

      selectedVin: computed(() => {
        const id = selectedVinId();
        if (!id) return null;
        return vins().find(v => v.id === id) ?? null;
      }),
    };
  }),

  withMethods((store) => ({
    openDrawer(vinId: string, stageId?: string) {
      patchState(store, {
        selectedVinId: vinId,
        selectedStageId: stageId ?? null,
        drawerOpen: true,
      });
    },
    closeDrawer() {
      patchState(store, { drawerOpen: false, selectedVinId: null, selectedStageId: null });
    },
    setFiltro(key: keyof FiltrosTracking, value: unknown) {
      patchState(store, { filtros: { ...store.filtros(), [key]: value } });
    },
    clearFiltros() {
      patchState(store, {
        filtros: { lineaNegocio: null, estado: null, hitoActual: null, busqueda: '' },
      });
    },
    toggleViewMode() {
      patchState(store, { viewMode: store.viewMode() === 'grouped' ? 'list' : 'grouped' });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
  }))
);
