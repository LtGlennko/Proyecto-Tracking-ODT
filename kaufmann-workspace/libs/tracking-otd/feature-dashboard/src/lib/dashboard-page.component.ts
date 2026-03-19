import { Component, inject, computed } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TrackingStore, AlertasStore } from '@kaufmann/tracking-otd/data-access';
import { KpiCardComponent, StatusBadgeComponent, VehicleIconComponent } from '@kaufmann/shared/ui';

@Component({
    selector: 'kf-dashboard-page',
    imports: [RouterLink, KpiCardComponent, StatusBadgeComponent, VehicleIconComponent],
    template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">Resumen operativo de VINs activos</p>
      </div>
    
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <kf-kpi-card
          title="VINs Activos"
          [value]="store.totalActivos()"
          color="#2E75B6"
          icon="🚛"
          />
        <kf-kpi-card
          title="En Proceso"
          [value]="enProceso()"
          color="#3b82f6"
          icon="⏳"
          />
        <kf-kpi-card
          title="Demorados"
          [value]="store.totalDemorados()"
          color="#ef4444"
          icon="🔴"
          />
        <kf-kpi-card
          title="Finalizados"
          [value]="store.totalFinalizados()"
          color="#10b981"
          icon="✅"
          />
      </div>
    
      <!-- Top 10 VINs table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 class="text-sm font-semibold text-slate-800">VINs Activos — Top 10</h2>
          <a routerLink="/tracking" class="text-xs text-blue-600 hover:underline">Ver todos →</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Modelo</th>
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Cumpl.</th>
                <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Días</th>
              </tr>
            </thead>
            <tbody>
              @for (vin of topVins(); track vin) {
                <tr
                  class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-2.5 text-xs font-medium text-slate-700">{{ vin.clientName }}</td>
                  <td class="px-4 py-2.5">
                    <div class="flex items-center gap-2">
                      <kf-vehicle-icon [icono]="vin.tipoVehiculo?.icono" size="sm" />
                      <span class="text-xs text-slate-600 truncate max-w-40">{{ vin.modelo }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-2.5">
                    <kf-status-badge [status]="$any(vin.estadoGeneral)" />
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-xs font-semibold" [class]="vin.cumplimiento >= 90 ? 'text-emerald-600' : vin.cumplimiento >= 70 ? 'text-amber-600' : 'text-red-600'">
                      {{ vin.cumplimiento }}%
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-xs font-semibold" [class]="vin.daysDelayed > 0 ? 'text-red-600' : 'text-emerald-600'">
                      {{ vin.daysDelayed > 0 ? '+' + vin.daysDelayed : vin.daysDelayed }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    
      <!-- Hito heatmap -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 class="text-sm font-semibold text-slate-800 mb-4">Rendimiento por Hito</h2>
        <div class="space-y-3">
          @for (h of hitoList(); track h.id) {
            <div class="flex items-center gap-3">
              <div class="w-24 text-xs text-slate-600 text-right">{{ h.name }}</div>
              <div class="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div class="h-full bg-emerald-400 transition-all" [style.width]="hitoOntime(h.id) + '%'" [attr.title]="'A tiempo: ' + hitoOntime(h.id) + '%'"></div>
                <div class="h-full bg-red-400 transition-all" [style.width]="hitoDemorado(h.id) + '%'" [attr.title]="'Demorado: ' + hitoDemorado(h.id) + '%'"></div>
              </div>
              <div class="w-20 text-xs text-slate-500">{{ hitoOntime(h.id) }}% ok</div>
            </div>
          }
        </div>
        <div class="flex gap-4 mt-3 text-xs text-slate-500">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-400 inline-block"></span> A tiempo</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-400 inline-block"></span> Demorado</span>
        </div>
      </div>
    
      <!-- Recent alerts -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-slate-800">Alertas Recientes</h2>
          <a routerLink="/alertas" class="text-xs text-blue-600 hover:underline">Ver todas →</a>
        </div>
        <div class="space-y-2">
          @for (alerta of recentAlertas(); track alerta) {
            <div
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <span class="text-base flex-shrink-0">{{ alerta.nivel === 'critico' ? '🔴' : '🟡' }}</span>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium text-slate-800 truncate">{{ alerta.clientName }} — {{ alerta.modelo }}</p>
                <p class="text-xs text-slate-500">{{ alerta.stageName }} · {{ alerta.subStageName }}</p>
              </div>
              <span class="text-xs font-semibold text-red-600 flex-shrink-0">+{{ alerta.delayDays }}d</span>
            </div>
          }
        </div>
      </div>
    </div>
    `
})
export class DashboardPageComponent {
  readonly store = inject(TrackingStore);
  readonly alertasStore = inject(AlertasStore);

  /** Derive unique hitos from loaded VIN data */
  hitoList = computed(() => {
    const seen = new Map<number, string>();
    for (const v of this.store.vins()) {
      for (const s of v.stages) {
        if (!seen.has(s.id)) seen.set(s.id, s.name);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  });

  enProceso = computed(() =>
    this.store.vins().filter(v => v.estadoGeneral === 'A TIEMPO').length
  );

  topVins = computed(() =>
    this.store.vins()
      .filter(v => v.estadoGeneral !== 'FINALIZADO')
      .slice(0, 10)
  );

  recentAlertas = computed(() =>
    this.alertasStore.alertas()
      .filter(a => a.status !== 'resolved')
      .slice(0, 5)
  );

  hitoOntime(hitoId: number): number {
    const vins = this.store.vins();
    if (vins.length === 0) return 0;
    const ontime = vins.filter(v => {
      const h = v.stages.find(s => s.id === hitoId);
      return h?.status === 'completed';
    }).length;
    return Math.round((ontime / vins.length) * 100);
  }

  hitoDemorado(hitoId: number): number {
    const vins = this.store.vins();
    if (vins.length === 0) return 0;
    const delayed = vins.filter(v => {
      const h = v.stages.find(s => s.id === hitoId);
      return h?.status === 'delayed';
    }).length;
    return Math.round((delayed / vins.length) * 100);
  }
}
