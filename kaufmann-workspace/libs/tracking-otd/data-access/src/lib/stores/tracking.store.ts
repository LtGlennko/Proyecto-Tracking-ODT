import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { VinModel, EstadoVin, ClienteModel } from '@kaufmann/shared/models';
import { EmpresaFilterService } from '@kaufmann/shared/auth';
import { TrackingApiService } from '../services/tracking-api.service';
import { firstValueFrom } from 'rxjs';

type FiltrosTracking = {
  tipoVehiculoId: number | null;
  estado: EstadoVin | null;
  hitoActual: number | null;
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
  selectedStageId: number | null;
  viewMode: 'grouped' | 'list';
};

const initialState: TrackingState = {
  clientes: [],
  vins: [],
  loading: false,
  error: null,
  filtros: { tipoVehiculoId: null, estado: null, hitoActual: null, busqueda: '' },
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
          if (f.tipoVehiculoId != null && v.tipoVehiculo?.id !== f.tipoVehiculoId) return false;
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
      totalActivos: computed(() => vins().filter(v => v.estadoGeneral !== 'ENTREGADO').length),
      totalFinalizados: computed(() => vins().filter(v => v.estadoGeneral === 'ENTREGADO').length),

      selectedVin: computed(() => {
        const id = selectedVinId();
        if (!id) return null;
        return vins().find(v => v.id === id) ?? null;
      }),

      /** Hierarchy filtered: clients -> fichas -> vins (preserving structure, filtering at VIN level) */
      clientesFiltrados: computed(() => {
        const f = filtros();
        const selectedEmpresaNombre = empresaFilter.selectedEmpresaNombre();

        return clientes()
          .filter(c => !selectedEmpresaNombre || c.empresa === selectedEmpresaNombre)
          .map(c => ({
            ...c,
            fichas: c.fichas.map(fi => ({
              ...fi,
              vins: fi.vins.filter(v => {
                if (f.estado && v.estadoGeneral !== f.estado) return false;
                if (f.tipoVehiculoId != null && v.tipoVehiculo?.id !== f.tipoVehiculoId) return false;
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
              }),
            })).filter(fi => fi.vins.length > 0),
          }))
          .filter(c => c.fichas.length > 0);
      }),
    };
  }),

  withMethods((store) => {
    const api = inject(TrackingApiService);

    return {
      async loadClientes() {
        patchState(store, { loading: true, error: null });
        try {
          const clientes = await firstValueFrom(api.getClientesHierarchy());
          const allVins = clientes.flatMap(c => c.fichas.flatMap(f => f.vins.map(v => ({ ...v, isVic: c.isVic ?? false }))));
          patchState(store, { clientes, vins: allVins, loading: false });
        } catch (err: any) {
          console.error('Error loading tracking data:', err);
          patchState(store, { loading: false, error: err?.message || 'Error cargando datos' });
        }
      },
      openDrawer(vinId: string, stageId?: number) {
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
          filtros: { tipoVehiculoId: null, estado: null, hitoActual: null, busqueda: '' },
        });
      },
      toggleViewMode() {
        patchState(store, { viewMode: store.viewMode() === 'grouped' ? 'list' : 'grouped' });
      },
      setViewMode(mode: 'grouped' | 'list') {
        patchState(store, { viewMode: mode });
      },
      setLoading(loading: boolean) {
        patchState(store, { loading });
      },
    };
  })
);
