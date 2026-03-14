import { Component, computed, input, output } from '@angular/core';

import { HitoTracking } from '@kaufmann/shared/models';

@Component({
    selector: 'kf-stage-node',
    imports: [],
    template: `
    <div
      class="relative flex flex-col items-center cursor-pointer group"
      (click)="nodeClick.emit(hito().id)"
      [attr.aria-label]="hito().name + ' - ' + hito().status"
      >
      <!-- Node circle -->
      <div [class]="nodeClass()">
        @switch (hito().status) {
          @case ('completed') {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          }
          @case ('delayed') {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01" />
            </svg>
          }
          @case ('active') {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          }
          @default {
            <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="5" stroke-width="2" />
            </svg>
          }
        }
      </div>
      <!-- Pulse ring for active/delayed -->
      @if (hito().status === 'active' || hito().status === 'delayed') {
        <div
          [class]="ringClass()"
        ></div>
      }
      <!-- Label -->
      <span class="mt-2 text-xs font-medium text-slate-600 whitespace-nowrap">
        {{ hito().name }}
      </span>
      <!-- Tooltip on hover -->
      <div class="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-56 text-xs">
        <p class="font-semibold text-slate-800 mb-1">{{ hito().name }}</p>
        <div class="space-y-1 text-slate-600 mb-2">
          <div class="flex justify-between gap-4">
            <span class="text-slate-400">Baseline:</span>
            <span>{{ formatD(hito().baseline.end) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-400">Plan:</span>
            <span>{{ formatD(hito().plan.end) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-400">Real:</span>
            <span [class]="hito().real.end ? 'text-slate-800' : 'text-slate-400'">
              {{ hito().real.end ? formatD(hito().real.end) : 'En curso' }}
            </span>
          </div>
        </div>
        <!-- Subetapas -->
        @if (hito().subStages.length > 0) {
          <div class="border-t border-slate-100 pt-2 mt-2 space-y-1.5">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subetapas</p>
            @for (sub of hito().subStages; track sub.id) {
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span [class]="subDotClass(sub.status)"></span>
                  <span class="truncate text-slate-600">{{ sub.name }}</span>
                </div>
                <span [class]="sub.real.end ? 'text-slate-700 font-medium' : 'text-slate-400'" class="whitespace-nowrap">
                  {{ sub.real.end ? formatD(sub.real.end) : '—' }}
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
    `
})
export class StageNodeComponent {
  hito = input.required<HitoTracking>();
  nodeClick = output<string>();

  formatD(d: string | null): string {
    if (!d) return '-';
    const date = new Date(d);
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date);
  }

  subDotClass(status: string): string {
    const base = 'w-1.5 h-1.5 rounded-full flex-shrink-0';
    switch (status) {
      case 'completed': return `${base} bg-emerald-500`;
      case 'active':    return `${base} bg-blue-500`;
      case 'delayed':   return `${base} bg-red-500`;
      default:          return `${base} bg-slate-300`;
    }
  }

  nodeClass = computed(() => {
    const base = 'relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10';
    switch (this.hito().status) {
      case 'completed': return `${base} bg-emerald-500 text-white shadow-sm`;
      case 'delayed':   return `${base} bg-white border-2 border-red-500 text-red-500`;
      case 'active':    return `${base} bg-white border-2 border-blue-500 text-blue-500`;
      default:          return `${base} bg-slate-100 border border-slate-200 text-slate-300`;
    }
  });

  ringClass = computed(() => {
    const base = 'absolute top-0 w-10 h-10 rounded-full animate-ping opacity-30';
    return this.hito().status === 'delayed'
      ? `${base} bg-red-400`
      : `${base} bg-blue-400`;
  });
}
