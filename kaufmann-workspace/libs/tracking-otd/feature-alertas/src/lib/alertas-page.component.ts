import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AlertasStore } from '@kaufmann/tracking-otd/data-access';

@Component({
  selector: 'kf-alertas-page',
  imports: [],
  template: `
    <div class="p-4 sm:p-6 space-y-4 max-w-[1400px]">

      <!-- Page title -->
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold text-slate-800">Gestión de Alertas</h1>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">En Desarrollo</span>
      </div>

      <!-- Tabs -->
      <div class="flex gap-0 border-b border-slate-200">
        <button
          (click)="activeTab.set('alertas')"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          [class]="activeTab() === 'alertas'
            ? 'border-brand-blue text-brand-blue'
            : 'border-transparent text-slate-500 hover:text-slate-700'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          Alertas de Sistema
          @if (store.totalAlertasNoLeidas() > 0) {
            <span class="bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {{ store.totalAlertasNoLeidas() }}
            </span>
          }
        </button>
        <button
          (click)="activeTab.set('menciones')"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          [class]="activeTab() === 'menciones'
            ? 'border-brand-blue text-brand-blue'
            : 'border-transparent text-slate-500 hover:text-slate-700'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
          </svg>
          Menciones
          @if (store.totalMencionesNoLeidas() > 0) {
            <span class="bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {{ store.totalMencionesNoLeidas() }}
            </span>
          }
        </button>
      </div>

      <!-- ── TAB: ALERTAS DE SISTEMA ── -->
      @if (activeTab() === 'alertas') {
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start">

          <!-- Left: inbox list -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span class="text-sm font-semibold text-slate-700">Bandeja de Entrada · Operaciones</span>
              <button
                (click)="store.markAllAlertasRead()"
                class="text-xs text-brand-blue hover:underline font-medium">
                Marcar todas como leídas
              </button>
            </div>

            <div class="divide-y divide-slate-100">
              @for (alerta of store.alertasFiltradas(); track alerta.id) {
                <div
                  (click)="store.selectAlerta(alerta.id)"
                  class="flex gap-0 cursor-pointer hover:bg-slate-50 transition-colors"
                  [class.bg-blue-50]="store.selectedAlertaId() === alerta.id">
                  <!-- Left accent bar -->
                  <div class="w-1 flex-shrink-0 rounded-l"
                    [class]="alerta.status === 'action_required' ? 'bg-brand-blue' : 'bg-transparent'">
                  </div>
                  <div class="flex-1 px-4 py-3 min-w-0">
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
                        [class]="alerta.nivel === 'critico'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'">
                        {{ alerta.nivel === 'critico' ? 'Crítico' : 'Advertencia' }}
                      </span>
                      <span class="text-xs text-slate-400 flex-shrink-0">{{ formatTimestamp(alerta.timestamp) }}</span>
                    </div>
                    <p class="text-sm font-semibold text-slate-800 truncate">{{ alerta.clientName }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ alerta.modelo }} · {{ alerta.vinId }}</p>
                    <p class="text-xs text-slate-600 mt-1">
                      Retraso en <span class="font-semibold">{{ alerta.stageName }}</span>: {{ alerta.delayDays }} días
                    </p>
                  </div>
                </div>
              }

              @if (store.alertasFiltradas().length === 0) {
                <div class="py-12 text-center text-slate-400 text-sm">No hay alertas activas.</div>
              }
            </div>
          </div>

          <!-- Right: detail panel -->
          @if (store.selectedAlerta(); as alerta) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <!-- Detail header -->
              <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  [class]="alerta.nivel === 'critico' ? 'bg-red-100' : 'bg-amber-100'">
                  <svg class="w-5 h-5" [class]="alerta.nivel === 'critico' ? 'text-red-600' : 'text-amber-600'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-800">Detalle de Alerta</p>
                  <p class="text-xs text-slate-400">ID: #{{ alerta.id }}</p>
                </div>
              </div>

              <div class="p-5 space-y-5">
                <!-- IMPACTO -->
                <div>
                  <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Impacto</p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-slate-500">Fecha Anterior:</span>
                      <span class="text-xs font-bold text-slate-700">{{ alerta.prevDate }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-slate-500">Nueva Fecha:</span>
                      <span class="text-xs font-bold text-red-600">{{ alerta.newDate }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-bold text-slate-700">Días de Retraso:</span>
                      <span class="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        +{{ alerta.delayDays }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- RESPONSABLE -->
                <div>
                  <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Responsable</p>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                    </svg>
                    <span class="text-sm text-slate-700">{{ alerta.responsibleArea }}</span>
                  </div>
                </div>

                <!-- ACCIONES RECOMENDADAS -->
                <div>
                  <p class="text-sm font-bold text-slate-700 mb-3">Acciones Recomendadas</p>
                  <div class="space-y-2">
                    <button class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                      <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                      </svg>
                      Contactar al Responsable
                    </button>
                    <button class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                      <svg class="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                      </svg>
                      Reprogramar Entrega
                    </button>
                  </div>
                </div>

                <!-- RESOLVER -->
                @if (alerta.status !== 'resolved') {
                  <button
                    (click)="store.updateStatus(alerta.id, 'resolved')"
                    class="w-full py-3 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-navy transition-colors">
                    Resolver Alerta
                  </button>
                } @else {
                  <div class="w-full py-3 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg text-center border border-emerald-200">
                    ✓ Alerta resuelta
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- ── TAB: MENCIONES ── -->
      @if (activeTab() === 'menciones') {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span class="text-sm font-semibold text-slate-700">Mis Menciones</span>
            <button
              (click)="store.markAllMencionesRead()"
              class="text-xs text-brand-blue hover:underline font-medium">
              Marcar todas como leídas
            </button>
          </div>

          <div class="divide-y divide-slate-100">
            @for (mencion of store.menciones(); track mencion.id) {
              <div class="flex gap-0">
                <div class="w-1 flex-shrink-0" [class]="!mencion.leida ? 'bg-brand-blue' : 'bg-transparent'"></div>
                <div class="flex-1 px-4 py-4 min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-blue-100 text-blue-700">
                      Mención
                    </span>
                    <span class="text-xs text-slate-400">{{ formatDate(mencion.fecha) }}</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-800">{{ mencion.vinId }}</p>
                  <p class="text-sm text-slate-600 mt-1">"{{ mencion.mensaje }}"</p>
                  <button class="text-xs text-brand-blue hover:underline mt-2 flex items-center gap-1">
                    Ver conversación
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                    </svg>
                  </button>
                </div>
              </div>
            }

            @if (store.menciones().length === 0) {
              <div class="py-12 text-center text-slate-400 text-sm">No tienes menciones.</div>
            }
          </div>
        </div>
      }

    </div>
  `,
})
export class AlertasPageComponent implements OnInit, OnDestroy {
  readonly store = inject(AlertasStore);
  private readonly route = inject(ActivatedRoute);
  activeTab = signal<'alertas' | 'menciones'>('alertas');
  private paramSub?: Subscription;

  ngOnInit() {
    this.paramSub = this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      this.activeTab.set(tab === 'menciones' ? 'menciones' : 'alertas');
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  formatTimestamp(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffH = (now.getTime() - date.getTime()) / 3600000;
    if (diffH < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: 'numeric' });
  }
}
