import { Component, inject, signal, computed, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackingStore } from '@kaufmann/tracking-otd/data-access';
import { VinModel, EstadoVin, TipoVehiculoModel, FichaModel, HitoTracking, HITO_LABELS, HITOS_IDS } from '@kaufmann/shared/models';
import { StatusBadgeComponent } from '@kaufmann/shared/ui';
import { VehicleIconComponent } from '@kaufmann/shared/ui';
import { TrackingDrawerComponent } from '../../components/tracking-drawer/tracking-drawer.component';
import { VisualMapComponent } from '../../components/visual-map/visual-map.component';
import { GanttViewComponent } from '../../components/gantt-view/gantt-view.component';
import { formatDate } from '@kaufmann/shared/utils';

/** Known tipo vehiculo options for filter dropdown */
const TIPO_VEHICULO_FILTER_OPTIONS: TipoVehiculoModel[] = [
  { id: 1, nombre: 'Camión', slug: 'camion', color: '#2563eb' },
  { id: 2, nombre: 'Bus', slug: 'bus', color: '#0ea5e9' },
  { id: 3, nombre: 'Maquinaria', slug: 'maquinaria', color: '#f97316' },
  { id: 4, nombre: 'Vehículo Ligero', slug: 'vehiculo_ligero', color: '#a855f7' },
];

@Component({
    selector: 'kf-tracking-list-page',
    imports: [FormsModule, StatusBadgeComponent, VehicleIconComponent, TrackingDrawerComponent, VisualMapComponent, GanttViewComponent],
    templateUrl: './tracking-list-page.component.html'
})
export class TrackingListPageComponent implements OnInit {
  readonly store = inject(TrackingStore);

  readonly HITO_LABELS = HITO_LABELS;
  readonly HITO_IDS = [...HITOS_IDS];

  currentPage = signal(1);
  readonly pageSize = 20;

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

  estadoOptions: EstadoVin[] = ['A TIEMPO', 'DEMORADO', 'FINALIZADO'];
  tipoVehiculoOptions: TipoVehiculoModel[] = TIPO_VEHICULO_FILTER_OPTIONS;

  pagedVins = computed(() => {
    const all = this.store.vinsFiltrados();
    const start = (this.currentPage() - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.store.vinsFiltrados().length / this.pageSize)));

  constructor() {
    this.searchInput$.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(val => {
      this.store.setFiltro('busqueda', val);
      this.currentPage.set(1);
    });
  }

  ngOnInit() {
    // Sync local searchValue with store (in case filters persisted from previous navigation)
    const storeBusqueda = this.store.filtros().busqueda;
    if (storeBusqueda) this.searchValue.set(storeBusqueda);

    this.store.loadClientes();
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
    this.currentPage.set(1);
  }

  setTipoVehiculo(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.store.setFiltro('tipoVehiculoId', val ? Number(val) : null);
    this.currentPage.set(1);
  }

  openDrawer(vinId: string, stageId?: string) {
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
      delivered: vins.filter(v => v.estadoGeneral === 'FINALIZADO').length,
      onTime: vins.filter(v => v.estadoGeneral === 'A TIEMPO').length,
      delayed: vins.filter(v => v.estadoGeneral === 'DEMORADO').length,
    };
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

  getHitoStatus(vin: VinModel, hitoId: string): string {
    return vin.stages.find(s => s.id === hitoId)?.status ?? 'pending';
  }

  getHitoDotClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'delayed':   return 'bg-red-500 animate-pulse';
      case 'active':    return 'bg-blue-500 animate-pulse';
      default:          return 'bg-slate-200';
    }
  }

  formatDate = formatDate;

  private readonly shortDateFmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' });

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

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  tipoBadgeClass(vin: VinModel): string {
    const slug = vin.tipoVehiculo?.slug ?? '';
    switch (slug) {
      case 'camion':          return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'vehiculo_ligero': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'maquinaria':      return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'bus':             return 'bg-sky-100 text-sky-700 border border-sky-200';
      default:                return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
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
}
