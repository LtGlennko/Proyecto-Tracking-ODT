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
  // Pagination
  page: number;
  pageSize: number;
  totalVins: number;
  // Summary (global counts)
  summaryTotal: number;
  summaryDemorado: number;
  summaryEnRiesgo: number;
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
  page: 1,
  pageSize: 50,
  totalVins: 0,
  summaryTotal: 0,
  summaryDemorado: 0,
  summaryEnRiesgo: 0,
};

export const TrackingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ vins, filtros, selectedVinId, clientes, page, pageSize, totalVins }) => {
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

      totalPages: computed(() => Math.ceil(totalVins() / pageSize())),

      /** Hierarchy filtered: clients -> fichas -> vins */
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
    const empresaFilter = inject(EmpresaFilterService);

    return {
      async loadClientes(page?: number, pageSize?: number) {
        const p = page ?? store.page();
        const ps = pageSize ?? store.pageSize();
        const f = store.filtros();
        patchState(store, { loading: true, error: null, page: p, pageSize: ps });
        try {
          const res = await firstValueFrom(api.getClientesHierarchy({
            page: p,
            pageSize: ps,
            busqueda: f.busqueda || undefined,
            estado: f.estado || undefined,
            tipoVehiculoId: f.tipoVehiculoId || undefined,
            empresaId: empresaFilter.selectedEmpresaId() || undefined,
          }));
          const clientes = res.data;
          const allVins = clientes.flatMap(c => c.fichas.flatMap(f => f.vins.map(v => ({ ...v, isVic: c.isVic ?? false }))));
          patchState(store, {
            clientes, vins: allVins, loading: false,
            totalVins: res.total, page: res.page, pageSize: res.pageSize,
          });
          // Load summary in parallel (non-blocking)
          firstValueFrom(api.getSummary({
            empresaId: empresaFilter.selectedEmpresaId() || undefined,
            tipoVehiculoId: f.tipoVehiculoId || undefined,
            busqueda: f.busqueda || undefined,
          })).then(s => {
            patchState(store, { summaryTotal: s.total, summaryDemorado: s.demorado, summaryEnRiesgo: s.enRiesgo || 0 });
          }).catch(() => {});
        } catch (err: any) {
          console.error('Error loading tracking data:', err);
          patchState(store, { loading: false, error: err?.message || 'Error cargando datos' });
        }
      },
      async nextPage() {
        const p = store.page();
        const total = store.totalPages();
        if (p < total) {
          await this.loadClientes(p + 1);
        }
      },
      async prevPage() {
        const p = store.page();
        if (p > 1) {
          await this.loadClientes(p - 1);
        }
      },
      async setPageSize(size: number) {
        await this.loadClientes(1, size);
      },
      openDrawer(vinId: string, stageId?: number) {
        patchState(store, {
          selectedVinId: vinId,
          selectedStageId: stageId ?? null,
          drawerOpen: true,
        });
      },
      closeDrawer() {
        patchState(store, { drawerOpen: false, selectedStageId: null });
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
