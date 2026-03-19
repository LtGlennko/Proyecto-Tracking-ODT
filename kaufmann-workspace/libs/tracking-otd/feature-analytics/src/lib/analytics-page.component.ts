import { Component, inject, computed } from '@angular/core';

import { TrackingStore } from '@kaufmann/tracking-otd/data-access';

@Component({
    selector: 'kf-analytics-page',
    imports: [],
    template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Analytics</h1>
        <p class="text-sm text-slate-500 mt-0.5">Métricas de rendimiento OTD</p>
      </div>
    
      <!-- OTD Gauge -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 col-span-1">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Cumplimiento OTD Global</h3>
          <div class="flex items-center justify-center">
            <div class="relative w-32 h-32">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="10"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="10"
                  [attr.stroke-dasharray]="otdPct() * 2.51 + ' 251'"
                  stroke-linecap="round"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-slate-800">{{ otdPct() }}%</span>
              </div>
            </div>
          </div>
          <p class="text-center text-xs text-slate-500 mt-2">{{ store.totalActivos() }} VINs activos</p>
        </div>
    
        <!-- Stats -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">Por Tipo de Vehículo</h3>
          <div class="space-y-2">
            @for (tipo of tipoVehiculoStats(); track tipo) {
              <div class="flex items-center gap-2">
                <span class="text-xs w-20 text-slate-600">{{ tipo.nombre }}</span>
                <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" [style.width]="tipo.pct + '%'"
                     [style.background-color]="tipo.color">
                  </div>
                </div>
                <span class="text-xs text-slate-500 w-8 text-right">{{ tipo.total }}</span>
              </div>
            }
          </div>
        </div>
    
        <!-- Lead time por hito -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 col-span-2">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">Volumen por Hito</h3>
          <div class="space-y-2">
            @for (h of hitoList(); track h.id) {
              <div class="flex items-center gap-3">
                <span class="text-xs w-20 text-right text-slate-600 shrink-0">{{ h.name }}</span>
                <div class="flex-1 h-5 bg-slate-50 rounded overflow-hidden border border-slate-100 flex">
                  <div class="h-full bg-emerald-400 transition-all flex items-center justify-end pr-1"
                    [style.width]="hitoOntime(h.id) + '%'">
                    @if (hitoOntime(h.id) > 15) {
                      <span class="text-[10px] text-white font-medium">{{ hitoOntime(h.id) }}%</span>
                    }
                  </div>
                  <div class="h-full bg-red-400 transition-all"
                    [style.width]="hitoDemorado(h.id) + '%'">
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="flex gap-4 mt-3 text-xs text-slate-500">
            <span class="flex items-center gap-1"><span class="w-3 h-2 rounded bg-emerald-400 inline-block"></span> A tiempo</span>
            <span class="flex items-center gap-1"><span class="w-3 h-2 rounded bg-red-400 inline-block"></span> Demorado</span>
          </div>
        </div>
      </div>
    
      <!-- Tendencia (placeholder for Chart.js integration) -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4">Tendencia de Entregas (últimos 6 meses)</h3>
        <div class="h-48 flex items-end gap-4 px-4 border-b border-slate-100">
          @for (bar of trendBars(); track bar) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs text-slate-500">{{ bar.value }}</span>
              <div class="w-full rounded-t-sm transition-all" [style.height]="(bar.value / maxTrend() * 100) + 'px'"
              [class]="bar.delayed > 0 ? 'bg-red-400' : 'bg-emerald-400'"></div>
              <span class="text-[10px] text-slate-400">{{ bar.label }}</span>
            </div>
          }
        </div>
      </div>
    </div>
    `
})
export class AnalyticsPageComponent {
  readonly store = inject(TrackingStore);
  hitoList = computed(() => {
    const seen = new Map<number, string>();
    for (const v of this.store.vins()) {
      for (const s of v.stages) {
        if (!seen.has(s.id)) seen.set(s.id, s.name);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  });

  otdPct = computed(() => {
    const vins = this.store.vins();
    if (vins.length === 0) return 0;
    const ontime = vins.filter(v => v.estadoGeneral === 'A TIEMPO' || v.estadoGeneral === 'FINALIZADO').length;
    return Math.round((ontime / vins.length) * 100);
  });

  tipoVehiculoStats = computed(() => {
    const vins = this.store.vins();
    const map: Record<string, { nombre: string; color: string; count: number }> = {};
    for (const v of vins) {
      const tv = v.tipoVehiculo;
      const key = String(tv?.id ?? 0);
      if (!map[key]) {
        map[key] = { nombre: tv?.nombre ?? 'Desconocido', color: tv?.color ?? '#94a3b8', count: 0 };
      }
      map[key].count++;
    }
    const total = vins.length || 1;
    return Object.values(map).map(entry => ({
      nombre: entry.nombre,
      color: entry.color,
      total: entry.count,
      pct: Math.round((entry.count / total) * 100),
    }));
  });

  trendBars = computed(() => {
    const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
    const values = [3, 5, 4, 6, 4, this.store.totalFinalizados()];
    return months.map((label, i) => ({ label, value: values[i] ?? 0, delayed: i === 2 ? 1 : 0 }));
  });

  maxTrend = computed(() => Math.max(...this.trendBars().map(b => b.value), 1));

  hitoOntime(hitoId: number): number {
    const vins = this.store.vins();
    if (!vins.length) return 0;
    return Math.round((vins.filter(v => v.stages.find(s => s.id === hitoId)?.status === 'completed').length / vins.length) * 100);
  }

  hitoDemorado(hitoId: number): number {
    const vins = this.store.vins();
    if (!vins.length) return 0;
    return Math.round((vins.filter(v => v.stages.find(s => s.id === hitoId)?.status === 'delayed').length / vins.length) * 100);
  }
}
