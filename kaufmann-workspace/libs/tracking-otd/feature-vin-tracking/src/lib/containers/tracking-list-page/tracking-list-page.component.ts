import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackingStore } from '@kaufmann/tracking-otd/data-access';
import { VinModel, EstadoVin, LineaNegocio, HITO_LABELS, HITOS_IDS } from '@kaufmann/shared/models';
import { StatusBadgeComponent } from '@kaufmann/shared/ui';
import { VehicleIconComponent } from '@kaufmann/shared/ui';
import { TrackingDrawerComponent } from '../../components/tracking-drawer/tracking-drawer.component';
import { formatDate } from '@kaufmann/shared/utils';

@Component({
  selector: 'kf-tracking-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, VehicleIconComponent, TrackingDrawerComponent],
  templateUrl: './tracking-list-page.component.html',
})
export class TrackingListPageComponent implements OnInit {
  readonly store = inject(TrackingStore);

  readonly HITO_LABELS = HITO_LABELS;
  readonly HITO_IDS = [...HITOS_IDS];

  currentPage = signal(1);
  readonly pageSize = 20;

  searchInput$ = new Subject<string>();
  searchValue = signal('');

  estadoOptions: EstadoVin[] = ['A TIEMPO', 'DEMORADO', 'FINALIZADO'];
  lineaOptions: LineaNegocio[] = ['VC', 'Autos', 'Maquinarias', 'Buses'];
  empresaOptions = ['Divemotor', 'Andes Motor', 'Andes Maq'];

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

  ngOnInit() {}

  onSearch(value: string) {
    this.searchValue.set(value);
    this.searchInput$.next(value);
  }

  setEstado(e: Event) {
    const val = (e.target as HTMLSelectElement).value as EstadoVin | '';
    this.store.setFiltro('estado', val || null);
    this.currentPage.set(1);
  }

  setLinea(e: Event) {
    const val = (e.target as HTMLSelectElement).value as LineaNegocio | '';
    this.store.setFiltro('lineaNegocio', val || null);
    this.currentPage.set(1);
  }

  setEmpresa(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.store.setFiltro('empresa', val || null);
    this.currentPage.set(1);
  }

  openDrawer(vinId: string, stageId?: string) {
    this.store.openDrawer(vinId, stageId);
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

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  lineaBadge(linea: string): string {
    switch (linea) {
      case 'VC':
      case 'Camiones': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Autos':    return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Maquinarias': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Buses':    return 'bg-sky-100 text-sky-700 border border-sky-200';
      default:         return 'bg-slate-100 text-slate-600 border border-slate-200';
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
