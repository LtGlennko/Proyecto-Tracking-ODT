import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TrackingStore } from '@kaufmann/tracking-otd/data-access';
import { StatusBadgeComponent, SearchBarComponent } from '@kaufmann/shared/ui';
import { VinModel, HitoTracking } from '@kaufmann/shared/models';

@Component({
  selector: 'kf-reporte-page',
  standalone: true,
  imports: [FormsModule, RouterLink, StatusBadgeComponent, SearchBarComponent],
  template: `
    <div class="p-3 sm:p-6 space-y-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-lg sm:text-xl font-bold text-slate-800">Reporte Maestro Detallado</h1>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <kf-search-bar
          placeholder="Filtrar reporte..."
          [value]="searchTerm()"
          (valueChange)="searchTerm.set($event)"
          (cleared)="searchTerm.set('')"
          containerClass="w-full sm:w-auto sm:flex-1 sm:max-w-md"
        />
        <div class="hidden sm:block flex-1"></div>
        <button (click)="exportCsv()"
          class="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Exportar CSV
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        <table class="w-full text-sm whitespace-nowrap">
          <!-- Header row 1: fixed + hito groups -->
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide sticky left-0 bg-slate-50 z-10" rowspan="2">VIN</th>
              <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-[180px] min-w-[180px] max-w-[180px]" rowspan="2">Cliente</th>
              <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide" rowspan="2">Modelo</th>
              <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide" rowspan="2">Lote</th>
              <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide" rowspan="2">Status</th>
              <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide" rowspan="2">Desviacion</th>
              @for (hito of hitoColumns(); track hito) {
                <th class="text-center px-1 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide border-l border-slate-200" colspan="3">
                  {{ hito }}
                </th>
              }
            </tr>
            <!-- Header row 2: Plan/Real/Dif per hito -->
            <tr class="border-b border-slate-300 bg-slate-50">
              @for (hito of hitoColumns(); track hito) {
                <th class="text-center px-2 py-1.5 text-[10px] font-medium text-slate-400 border-l border-slate-200">Plan</th>
                <th class="text-center px-2 py-1.5 text-[10px] font-medium text-slate-400">Real</th>
                <th class="text-center px-2 py-1.5 text-[10px] font-medium text-slate-400">Dif.</th>
              }
            </tr>
          </thead>

          <tbody>
            @for (row of filteredRows(); track row.vin.id) {
              <tr class="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                <td class="px-3 py-2.5 sticky left-0 bg-white z-10">
                  <span class="font-mono text-xs font-semibold text-slate-700">{{ row.vinShort }}</span>
                </td>
                <td class="px-3 py-2.5 text-xs text-slate-700 w-[180px] min-w-[180px] max-w-[180px] whitespace-normal break-words">{{ row.vin.clientName }}</td>
                <td class="px-3 py-2.5 text-xs text-slate-700">{{ row.vin.modelo }}</td>
                <td class="px-3 py-2.5 text-xs text-slate-500">{{ row.vin.lote || '-' }}</td>
                <td class="px-3 py-2.5 text-center">
                  <kf-status-badge [status]="$any(row.vin.estadoGeneral)" />
                </td>
                <td class="px-3 py-2.5 text-center">
                  @if (row.totalDev > 0) {
                    <span class="text-xs font-bold text-red-600">+{{ row.totalDev }} d</span>
                  } @else if (row.totalDev < 0) {
                    <span class="text-xs font-bold text-emerald-600">{{ row.totalDev }} d</span>
                  } @else {
                    <span class="text-xs text-slate-400">-</span>
                  }
                </td>
                @for (cell of row.hitoCells; track $index) {
                  <td class="px-2 py-2.5 text-center text-xs text-slate-500 border-l border-slate-100">{{ cell.plan || '-' }}</td>
                  <td class="px-2 py-2.5 text-center text-xs font-medium" [class]="cell.realClass">{{ cell.real || '-' }}</td>
                  <td class="px-2 py-2.5 text-center text-xs" [class]="cell.difClass">{{ cell.dif ?? '-' }}</td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="6 + hitoColumns().length * 3" class="text-center py-12 text-slate-400 text-sm">
                  No se encontraron resultados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span class="text-xs text-slate-500">
            Página {{ store.page() }} de {{ store.totalPages() }} · {{ store.totalVins() }} VINs
          </span>
          <select
            [ngModel]="store.pageSize()"
            (ngModelChange)="store.setPageSize($event)"
            class="text-xs rounded border border-slate-200 bg-white px-2 py-1 text-slate-600">
            <option [value]="50">50 por página</option>
            <option [value]="100">100 por página</option>
            <option [value]="150">150 por página</option>
            <option [value]="200">200 por página</option>
          </select>
        </div>
        <div class="flex gap-2">
          @if (store.page() > 1) {
            <button
              (click)="store.prevPage()"
              class="px-3 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
            >← Anterior</button>
          }
          @if (store.page() < store.totalPages()) {
            <button
              (click)="store.nextPage()"
              class="px-3 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
            >Siguiente →</button>
          }
        </div>
      </div>

    </div>
  `,
})
export class ReportePageComponent implements OnDestroy {
  readonly store = inject(TrackingStore);
  searchTerm = signal('');

  ngOnDestroy() {
    this.searchTerm.set('');
  }

  private readonly shortDateFmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC' });

  hitoColumns = computed(() => {
    const vins = this.store.vinsFiltrados();
    if (vins.length === 0) return [];
    const sample = vins.find(v => v.stages.length > 0) || vins[0];
    return sample.stages.map(s => s.name);
  });

  filteredRows = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    let vins = this.store.vinsFiltrados();
    if (term) {
      vins = vins.filter(v =>
        v.id.toLowerCase().includes(term) ||
        v.clientName.toLowerCase().includes(term) ||
        v.modelo.toLowerCase().includes(term) ||
        (v.lote || '').toLowerCase().includes(term)
      );
    }
    return vins.map(vin => this.buildRow(vin));
  });

  private buildRow(vin: VinModel) {
    const hitoCells: { plan: string; real: string; dif: string | null; realClass: string; difClass: string }[] = [];
    let totalDev = 0;

    for (const stage of vin.stages) {
      const lastSub = stage.subStages[stage.subStages.length - 1];
      const planStr = lastSub?.plan?.end || lastSub?.plan?.start || stage.plan?.end || stage.plan?.start || '';
      const realStr = lastSub?.real?.end || lastSub?.real?.start || stage.real?.end || stage.real?.start || '';

      const plan = planStr ? this.fmtDate(planStr) : '';
      const real = realStr ? this.fmtDate(realStr) : '';

      let dif: string | null = null;
      let difClass = 'text-slate-400';
      let realClass = 'text-slate-700';

      if (planStr && realStr) {
        const planMs = new Date(planStr + 'T00:00:00Z').getTime();
        const realMs = new Date(realStr + 'T00:00:00Z').getTime();
        const days = Math.round((realMs - planMs) / 86400000);
        if (days > 0) {
          dif = `+${days}`;
          difClass = 'text-red-600 font-bold';
          realClass = 'text-red-600 font-semibold bg-red-50';
          totalDev += days;
        } else if (days < 0) {
          dif = `${days}`;
          difClass = 'text-emerald-600 font-medium';
          realClass = 'text-emerald-600 font-medium';
        } else {
          dif = '-';
          realClass = 'text-slate-700';
        }
      } else if (realStr) {
        realClass = 'text-slate-700';
      }

      hitoCells.push({ plan, real, dif, realClass, difClass });
    }

    // Shorten VIN for display
    const vinShort = vin.id.length > 12
      ? vin.id.substring(0, 3) + '-' + vin.id.substring(vin.id.length - 7)
      : vin.id;

    return { vin, vinShort, hitoCells, totalDev };
  }

  private fmtDate(d: string): string {
    const date = new Date(d + 'T00:00:00Z');
    if (isNaN(date.getTime())) return '-';
    return this.shortDateFmt.format(date);
  }

  exportCsv(): void {
    const rows = this.filteredRows();
    if (rows.length === 0) return;

    const hitos = this.hitoColumns();
    const headers = [
      'VIN', 'Cliente', 'Modelo', 'Lote', 'Status', 'Desviacion',
      ...hitos.flatMap(h => [`${h} (Plan)`, `${h} (Real)`, `${h} (Dif)`]),
    ];

    const csvRows = rows.map(r => [
      r.vin.id, r.vin.clientName, r.vin.modelo, r.vin.lote || '',
      r.vin.estadoGeneral, r.totalDev > 0 ? `+${r.totalDev}` : String(r.totalDev),
      ...r.hitoCells.flatMap(c => [c.plan || '', c.real || '', c.dif ?? '']),
    ]);

    const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...csvRows.map(r => r.map(escape).join(','))].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-maestro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
