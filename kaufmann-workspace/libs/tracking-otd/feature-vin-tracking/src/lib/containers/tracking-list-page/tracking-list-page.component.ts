import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';

import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackingStore, TipoVehiculoService } from '@kaufmann/tracking-otd/data-access';
import { VinModel, EstadoVin, TipoVehiculoModel, FichaModel, HitoTracking } from '@kaufmann/shared/models';
import { HoverSubStage } from '@kaufmann/shared/ui';
import { StatusBadgeComponent, SearchBarComponent, HitoHoverCardComponent, PaginationComponent } from '@kaufmann/shared/ui';
import { VehicleIconComponent } from '@kaufmann/shared/ui';
import { TrackingDrawerComponent } from '../../components/tracking-drawer/tracking-drawer.component';
import { VisualMapComponent } from '../../components/visual-map/visual-map.component';
import { GanttViewComponent } from '../../components/gantt-view/gantt-view.component';
import {
  formatDate, resolveSubFecha,
  stageStatusLabel, stageStatusLabelClass,
  subStatusLabel, subStatusBadgeClass,
  hitoDotClass, downloadCsv,
} from '@kaufmann/shared/utils';
import { LucideAngularModule } from 'lucide-angular';


@Component({
    selector: 'kf-tracking-list-page',
    imports: [NgStyle, FormsModule, StatusBadgeComponent, SearchBarComponent, VehicleIconComponent, TrackingDrawerComponent, VisualMapComponent, GanttViewComponent, LucideAngularModule, HitoHoverCardComponent, PaginationComponent],
    templateUrl: './tracking-list-page.component.html'
})
export class TrackingListPageComponent implements OnInit, OnDestroy {
  readonly store = inject(TrackingStore);


  currentPage = computed(() => this.store.page());
  totalPages = computed(() => this.store.totalPages());
  readonly pageSize = 50;

  searchInput$ = new Subject<string>();
  searchValue = signal('');

  // Computed signals to reflect store filter state in UI controls
  selectedTipoVehiculoId = computed(() => this.store.filtros().tipoVehiculoId?.toString() ?? '');
  selectedEstado = computed(() => this.store.filtros().estado ?? '');

  // Expand/collapse state for grouped view
  expandedRows = signal<Set<string>>(new Set());

  // VIN selected for inline visual map (null = show list)
  visualMapVin = signal<VinModel | null>(null);

  // Toggle between visual map and gantt within VIN detail view
  vinViewMode = signal<'map' | 'gantt'>('map');

  private readonly tvService = inject(TipoVehiculoService);
  estadoOptions = [
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'A TIEMPO', label: 'A Tiempo' },
    { value: 'EN RIESGO', label: 'En Riesgo' },
    { value: 'DEMORADO', label: 'Demorado' },
  ];
  tipoVehiculoOptions = this.tvService.items;
  hoveredStageKey = signal<string | null>(null);
  hoverPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  private isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  onHitoHover(vinId: string, stageId: number, event: MouseEvent) {
    if (this.isTouchDevice) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.hoverPos.set({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
    this.hoveredStageKey.set(vinId + ':' + stageId);
  }

  pagedVins = computed(() => this.store.vinsFiltrados());

  constructor() {
    this.searchInput$.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(val => {
      this.store.setFiltro('busqueda', val);
      this.store.loadClientes(1);
    });
  }

  ngOnInit() {
    // Sync local searchValue with store (in case filters persisted from previous navigation)
    const storeBusqueda = this.store.filtros().busqueda;
    if (storeBusqueda) this.searchValue.set(storeBusqueda);

    this.tvService.load();
    this.store.loadClientes();
  }

  ngOnDestroy() {
    this.searchValue.set('');
    this.store.setFiltro('busqueda', '');
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    this.searchInput$.next(value);
  }

  clearSearch() {
    this.searchValue.set('');
    this.searchInput$.next('');
  }

  setEstado(e: Event) {
    const val = (e.target as HTMLSelectElement).value as EstadoVin | '';
    this.store.setFiltro('estado', val || null);
    this.store.loadClientes(1);
  }

  setEstadoValue(val: string) {
    this.store.setFiltro('estado', val || null);
    this.store.loadClientes(1);
  }

  setTipoVehiculo(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.store.setFiltro('tipoVehiculoId', val ? Number(val) : null);
    this.store.loadClientes(1);
  }

  setTipoVehiculoValue(val: string) {
    this.store.setFiltro('tipoVehiculoId', val ? Number(val) : null);
    this.store.loadClientes(1);
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedEstado() || this.selectedTipoVehiculoId());
  }

  clearAllFilters() {
    this.store.setFiltro('estado', null);
    this.store.setFiltro('tipoVehiculoId', null);
    this.store.loadClientes(1);
  }

  openDrawer(vinId: string, stageId?: number) {
    this.store.openDrawer(vinId, stageId);
  }

  // -- Grouped view helpers --

  toggleExpand(id: string): void {
    this.expandedRows.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedRows().has(id);
  }

  flattenVins(fichas: FichaModel[]): VinModel[] {
    return fichas.flatMap(f => f.vins);
  }

  calcStats(vins: VinModel[]): { total: number; delivered: number; onTime: number; delayed: number } {
    return {
      total: vins.length,
      delivered: vins.filter(v => v.estadoGeneral === 'ENTREGADO').length,
      onTime: vins.filter(v => v.estadoGeneral === 'A TIEMPO').length,
      delayed: vins.filter(v => v.estadoGeneral === 'DEMORADO').length,
    };
  }

  // -- Export CSV --

  exportCsv(): void {
    const allVins = this.store.vinsFiltrados();
    if (allVins.length === 0) return;

    // Build dynamic subetapa columns from first VIN's stages
    const subCols: { hito: string; sub: string }[] = [];
    const sampleVin = allVins.find(v => v.stages.length > 0) || allVins[0];
    for (const stage of sampleVin.stages) {
      for (const sub of stage.subStages) {
        subCols.push({ hito: stage.name, sub: sub.name });
      }
    }

    // Header
    const headers = [
      'VIN', 'Cliente', 'Ficha', 'Tipo Vehiculo', 'Modelo', 'Lote', 'OC',
      'Forma de Pago', 'Ejecutivo', 'Estado', 'F. Inicial', 'F. Estimada',
      ...subCols.flatMap(c => [`${c.hito} - ${c.sub} (Real)`, `${c.hito} - ${c.sub} (Plan)`]),
    ];

    // Rows
    const rows = allVins.map(vin => {
      const subValues: string[] = [];
      for (const stage of vin.stages) {
        for (const sub of stage.subStages) {
          subValues.push(sub.real?.end || sub.real?.start || '');
          subValues.push(sub.plan?.end || sub.plan?.start || '');
        }
      }
      // Pad if VIN has fewer stages than sample
      while (subValues.length < subCols.length * 2) subValues.push('', '');

      return [
        vin.id,
        vin.clientName,
        vin.fichaId,
        vin.tipoVehiculo?.nombre || '',
        vin.modelo,
        vin.lote,
        vin.ordenCompra,
        vin.formaPago,
        vin.ejecutivo,
        vin.estadoGeneral,
        this.getFirstDate(vin),
        this.getLastDate(vin),
        ...subValues,
      ];
    });

    downloadCsv(headers, rows, `tracking-otd-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // -- Visual map --

  showVisualMap(vin: VinModel, event: Event): void {
    event.stopPropagation();
    this.visualMapVin.set(vin);
  }

  closeVisualMap(): void {
    this.visualMapVin.set(null);
  }

  // -- Shared helpers --

  mapSubStages(stage: HitoTracking): HoverSubStage[] {
    return stage.subStages.map((sub: any) => {
      const sf = this.getSubFecha(sub);
      return { name: sub.name, status: sub.status, fecha: sf.text || undefined, esPlan: sf.esPlan };
    });
  }

  getSubetapaTooltip(stage: HitoTracking): string {
    if (!stage.subStages || stage.subStages.length === 0) return stage.name;
    const subs = stage.subStages.map(s => `  · ${s.name}`).join('\n');
    return `${stage.name}\n${subs}`;
  }

  getHitoStatus(vin: VinModel, hitoId: number): string {
    return vin.stages.find(s => s.id === hitoId)?.status ?? 'pending';
  }

  getSubFecha(sub: { real: { start: string | null; end: string | null }; plan: { start: string | null; end: string | null } }): { text: string; esPlan: boolean } {
    const result = resolveSubFecha(sub.real, sub.plan);
    return { text: result.raw ? this.fmtDate(result.raw) : '', esPlan: result.esPlan };
  }

  getActiveStage(vin: VinModel): HitoTracking | null {
    const stages = vin.stages;

    // All active/delayed candidates — take the last one in array order
    const candidates = stages.filter(s => s.status === 'active' || s.status === 'delayed');
    if (candidates.length > 0) {
      const last = candidates[candidates.length - 1];
      // If it belongs to a parallel group, pick the worst among group peers
      if (last.grupoParaleloId != null) {
        const peers = candidates.filter(s => s.grupoParaleloId === last.grupoParaleloId);
        // delayed beats active; among same status pick the one with latest plan/real end
        const delayed = peers.filter(s => s.status === 'delayed');
        const pool = delayed.length > 0 ? delayed : peers;
        return pool.reduce((worst, s) => {
          const d = (s.plan?.end ?? s.plan?.start ?? '');
          const w = (worst.plan?.end ?? worst.plan?.start ?? '');
          return d > w ? s : worst;
        });
      }
      return last;
    }

    // Fallback: last completed stage, respecting parallel groups (take worst in group)
    const reversed = stages.slice().reverse();
    const lastCompleted = reversed.find(s => s.status === 'completed');
    if (!lastCompleted) return null;
    if (lastCompleted.grupoParaleloId != null) {
      const peers = stages.filter(
        s => s.grupoParaleloId === lastCompleted.grupoParaleloId && s.status === 'completed'
      );
      return peers.reduce((latest, s) => {
        const d = (s.real?.end ?? s.real?.start ?? s.plan?.end ?? s.plan?.start ?? '');
        const l = (latest.real?.end ?? latest.real?.start ?? latest.plan?.end ?? latest.plan?.start ?? '');
        return d > l ? s : latest;
      });
    }
    return lastCompleted;
  }

  getStageDate(stage: HitoTracking, field: 'baseline' | 'plan' | 'real'): string {
    const d = stage[field]?.end || stage[field]?.start;
    return d ? this.fmtDate(d) : '—';
  }

  getStageDev(stage: HitoTracking): number | null {
    const realStr = stage.real?.end || stage.real?.start;
    const planStr = stage.plan?.end || stage.plan?.start;
    if (!realStr || !planStr) return null;
    return Math.round((new Date(realStr + 'T00:00:00').getTime() - new Date(planStr + 'T00:00:00').getTime()) / 86400000);
  }

  stageDotClass(status: string): string {
    if (status === 'completed') return 'bg-st-ontime';
    if (status === 'delayed') return 'bg-st-delayed';
    if (status === 'active') return 'bg-st-active';
    return 'bg-slate-300';
  }

  getLastPlanDate(stage: HitoTracking): string {
    for (let i = stage.subStages.length - 1; i >= 0; i--) {
      const p = stage.subStages[i].plan?.end || stage.subStages[i].plan?.start;
      if (p) return this.fmtDate(p);
    }
    return '—';
  }

  getStatusLabel = stageStatusLabel;
  getStatusLabelClass = stageStatusLabelClass;
  getSubStatusLabel = subStatusLabel;
  getSubStatusBadgeClass = subStatusBadgeClass;
  getHitoDotClass = hitoDotClass;

  formatDate = formatDate;

  private readonly shortDateFmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC' });

  /** Fecha más antigua entre todos los VINs de una ficha */
  getOldestDate(ficha: FichaModel): string {
    let oldest: Date | null = null;
    for (const vin of ficha.vins) {
      for (const stage of vin.stages) {
        for (const sub of stage.subStages) {
          const d = sub.real?.start || sub.real?.end || sub.plan?.start || sub.plan?.end;
          if (d) {
            const date = new Date(d + 'T00:00:00Z');
            if (!isNaN(date.getTime()) && (!oldest || date < oldest)) {
              oldest = date;
            }
          }
        }
      }
    }
    return oldest ? oldest.toISOString().slice(0, 10) : '—';
  }

  /** F. Inicial: fecha de la primera subetapa del flujo */
  getFirstDate(vin: VinModel): string {
    const first = vin.stages?.[0]?.subStages?.[0];
    if (!first) return '—';
    const d = first.plan.start || first.real.start || first.baseline.start;
    return d ? this.fmtDate(d) : '—';
  }

  /** F. Estimada: fecha de la última subetapa del flujo */
  getLastDate(vin: VinModel): string {
    const lastStage = vin.stages?.[vin.stages.length - 1];
    const last = lastStage?.subStages?.[lastStage.subStages.length - 1];
    if (!last) return '—';
    const d = last.plan.end || last.real.end || last.baseline.end;
    return d ? this.fmtDate(d) : '—';
  }

  private fmtDate(d: string): string {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return this.shortDateFmt.format(date);
  }

  prevPage() { this.store.prevPage(); }
  nextPage() { this.store.nextPage(); }

  tipoBadgeStyle(vin: VinModel): Record<string, string> {
    const color = vin.tipoVehiculo?.color || '#94a3b8';
    return { 'background-color': color + '1A', color, 'border': `1px solid ${color}40` };
  }

  pagoPill(forma: string): string {
    switch (forma) {
      case 'Leasing':              return 'bg-violet-100 text-violet-700';
      case 'Renting':              return 'bg-pink-100 text-pink-700';
      case 'Contado':              return 'bg-emerald-100 text-emerald-700';
      case 'Financiamiento directo':
      case 'Financiamiento BK':   return 'bg-amber-100 text-amber-700';
      default:                    return 'bg-slate-100 text-slate-600';
    }
  }

  // ── Indicators ──

  getEtaEntrega(vin: VinModel): { real: string; plan: string } {
    const stages = vin.stages;
    if (!stages || stages.length === 0) return { real: '', plan: '' };
    const lastStage = stages[stages.length - 1];
    const subs = lastStage.subStages;
    if (!subs || subs.length === 0) return { real: '', plan: '' };
    const lastSub = subs[subs.length - 1];
    const real = lastSub.real?.end || lastSub.real?.start;
    const plan = lastSub.plan?.end || lastSub.plan?.start;
    return {
      real: real ? this.fmtDate(real) : '',
      plan: plan ? this.fmtDate(plan) : '',
    };
  }

  getDesviacionAcumulada(vin: VinModel): { total: number; adelanto: number } {
    let totalDays = 0;
    let adelantoDays = 0;
    for (const stage of vin.stages) {
      for (const sub of stage.subStages) {
        const realStr = sub.real?.end || sub.real?.start;
        const planStr = sub.plan?.end || sub.plan?.start;
        if (realStr && planStr) {
          const real = new Date(realStr + 'T00:00:00').getTime();
          const plan = new Date(planStr + 'T00:00:00').getTime();
          if (!isNaN(real) && !isNaN(plan)) {
            const diff = Math.round((real - plan) / 86400000);
            totalDays += diff;
            if (diff < 0) adelantoDays += diff;
          }
        }
      }
    }
    return { total: totalDays, adelanto: adelantoDays };
  }

  getRelativeTime(iso: string): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '—';
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Justo ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return 'Hace 1 mes';
    return `Hace ${diffMonths} meses`;
  }

}
