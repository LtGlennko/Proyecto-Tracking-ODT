import { Component, inject, signal } from '@angular/core';

import { AlertasStore } from '@kaufmann/tracking-otd/data-access';
import { AlertaModel, SeveridadAlerta, EstadoAlerta } from '@kaufmann/shared/models';
import { formatDate } from '@kaufmann/shared/utils';

@Component({
    selector: 'kf-alertas-page',
    imports: [],
    template: `
    <div class="p-6 space-y-5">
    
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-800">Alertas</h1>
          <p class="text-sm text-slate-500 mt-0.5">Bandeja de alertas por SLA</p>
        </div>
      </div>
    
      <!-- Counters -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <span class="text-2xl">🔴</span>
          <div>
            <div class="text-2xl font-bold text-red-700">{{ store.totalCriticas() }}</div>
            <div class="text-xs text-red-600 font-medium">Críticas</div>
          </div>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <span class="text-2xl">🟡</span>
          <div>
            <div class="text-2xl font-bold text-amber-700">{{ store.totalAdvertencias() }}</div>
            <div class="text-xs text-amber-600 font-medium">Advertencias</div>
          </div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div>
            <div class="text-2xl font-bold text-emerald-700">{{ store.totalResueltas() }}</div>
            <div class="text-xs text-emerald-600 font-medium">Resueltas</div>
          </div>
        </div>
      </div>
    
      <!-- Filters -->
      <div class="bg-white rounded-lg border border-slate-200 p-3 flex gap-3 flex-wrap">
        <select (change)="setSeveridad($event)" class="text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 focus:outline-none">
          <option value="">Todas las severidades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <select (change)="setEstado($event)" class="text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 focus:outline-none">
          <option value="">Todos los estados</option>
          <option value="action_required">Acción requerida</option>
          <option value="read">Leída</option>
          <option value="resolved">Resuelta</option>
        </select>
        <select (change)="setArea($event)" class="text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 focus:outline-none">
          <option value="">Todas las áreas</option>
          <option value="COMEX">COMEX</option>
          <option value="LOGISTICA">LOGÍSTICA</option>
          <option value="COMERCIAL">COMERCIAL</option>
        </select>
      </div>
    
      <!-- Alert cards -->
      <div class="space-y-3">
        @for (alerta of store.alertasFiltradas(); track alerta) {
          <div
            class="bg-white rounded-lg border shadow-sm p-4 transition-all"
            [class]="alerta.nivel === 'critico' ? 'border-red-200' : 'border-amber-200'"
            >
            <div class="flex items-start gap-4">
              <!-- Severity icon -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                [class]="alerta.nivel === 'critico' ? 'bg-red-100' : 'bg-amber-100'">
                <span class="text-lg">{{ alerta.nivel === 'critico' ? '🚨' : '⚠️' }}</span>
              </div>
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ alerta.modelo }} · {{ alerta.clientName }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ alerta.stageName }} › {{ alerta.subStageName }} ·
                      <span class="font-medium text-slate-600">{{ alerta.responsibleArea }}</span>
                    </p>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    [class]="statusBadge(alerta.status)">
                    {{ statusLabel(alerta.status) }}
                  </span>
                </div>
                <!-- Date deviation -->
                <div class="mt-2 flex items-center gap-2 text-xs">
                  <span class="text-slate-400">Prev:</span>
                  <span class="font-medium text-slate-600">{{ formatDate(alerta.prevDate) }}</span>
                  <span class="text-slate-300">→</span>
                  <span class="font-medium text-red-600">{{ formatDate(alerta.newDate) }}</span>
                  <span class="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">+{{ alerta.delayDays }}d</span>
                </div>
                <!-- Actions -->
                <div class="mt-3 flex gap-2 flex-wrap">
                  @if (alerta.status !== 'resolved') {
                    <button
                      (click)="markResolved(alerta.id)"
                      class="px-3 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      ✓ Marcar resuelta
                    </button>
                  }
                  @if (alerta.status === 'action_required') {
                    <button
                      (click)="markRead(alerta.id)"
                      class="px-3 py-1.5 text-xs rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
                      Marcar leída
                    </button>
                  }
                  <button class="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                    📧 Contactar área
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
    
        @if (store.alertasFiltradas().length === 0) {
          <div
            class="text-center py-12 text-slate-400">
            No hay alertas con los filtros actuales.
          </div>
        }
      </div>
    </div>
    `
})
export class AlertasPageComponent {
  readonly store = inject(AlertasStore);
  readonly formatDate = formatDate;

  setSeveridad(e: Event) {
    const val = (e.target as HTMLSelectElement).value as SeveridadAlerta | '';
    this.store.setFiltro('filtroSeveridad', val || null);
  }

  setEstado(e: Event) {
    const val = (e.target as HTMLSelectElement).value as EstadoAlerta | '';
    this.store.setFiltro('filtroEstado', val || null);
  }

  setArea(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.store.setFiltro('filtroArea', val || null);
  }

  markResolved(id: string) { this.store.updateStatus(id, 'resolved'); }
  markRead(id: string) { this.store.updateStatus(id, 'read'); }

  statusLabel(s: EstadoAlerta): string {
    return { action_required: 'Acción requerida', read: 'Leída', resolved: 'Resuelta' }[s];
  }

  statusBadge(s: EstadoAlerta): string {
    return {
      action_required: 'bg-red-50 text-red-700 border border-red-200',
      read: 'bg-slate-50 text-slate-600 border border-slate-200',
      resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    }[s];
  }
}
