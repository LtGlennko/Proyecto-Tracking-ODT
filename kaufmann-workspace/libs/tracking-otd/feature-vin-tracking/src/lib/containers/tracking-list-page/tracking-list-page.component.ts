import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackingStore, TipoVehiculoService } from '@kaufmann/tracking-otd/data-access';
import { VinModel, EstadoVin, TipoVehiculoModel, FichaModel, HitoTracking } from '@kaufmann/shared/models';
import { StatusBadgeComponent, SearchBarComponent } from '@kaufmann/shared/ui';
import { VehicleIconComponent } from '@kaufmann/shared/ui';
import { TrackingDrawerComponent } from '../../components/tracking-drawer/tracking-drawer.component';
import { VisualMapComponent } from '../../components/visual-map/visual-map.component';
import { GanttViewComponent } from '../../components/gantt-view/gantt-view.component';
import { formatDate, resolveSubFecha } from '@kaufmann/shared/utils';
import { LucideAngularModule } from 'lucide-angular';


@Component({
    selector: 'kf-tracking-list-page',
    imports: [FormsModule, StatusBadgeComponent, SearchBarComponent, VehicleIconComponent, TrackingDrawerComponent, VisualMapComponent, GanttViewComponent, LucideAngularModule],
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
    { value: 'DEMORADO', label: 'Demorado' },
  ];
  tipoVehiculoOptions = this.tvService.items;
  hoveredStageKey = signal<string | null>(null);
  hoverPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  onHitoHover(vinId: string, stageId: number, event: MouseEvent) {
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

    // Build CSV
    const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');

    // Download
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-otd-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  getLastPlanDate(stage: HitoTracking): string {
    for (let i = stage.subStages.length - 1; i >= 0; i--) {
      const p = stage.subStages[i].plan?.end || stage.subStages[i].plan?.start;
      if (p) return this.fmtDate(p);
    }
    return '—';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'delayed': return 'Demorado';
      case 'active': return 'En curso';
      default: return 'Pendiente';
    }
  }

  getStatusLabelClass(status: string): string {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-500 bg-slate-100';
    }
  }

  getSubStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'A tiempo';
      case 'completed-risk': return 'En tolerancia';
      case 'completed-late': return 'Crítico';
      case 'on-time': return 'A tiempo';
      case 'at-risk': return 'En tolerancia';
      case 'delayed': return 'Crítico';
      default: return 'Pendiente';
    }
  }

  getSubStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600';
      case 'completed-risk': return 'bg-amber-50 text-amber-600';
      case 'completed-late': return 'bg-red-50 text-red-600';
      case 'on-time': return 'bg-slate-50 text-slate-400';
      case 'at-risk': return 'bg-amber-50 text-amber-600';
      case 'delayed': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  }

  getHitoDotClass(status: string): string {
    switch (status) {
      case 'completed': return 'border-2 border-emerald-500 bg-emerald-50 text-emerald-600';
      case 'delayed':   return 'border-2 border-red-500 bg-red-50 text-red-600 animate-pulse';
      case 'active':    return 'border-2 border-blue-400 bg-blue-50 text-blue-500 animate-pulse';
      default:          return 'border-2 border-slate-300 bg-slate-50 text-slate-400';
    }
  }

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
