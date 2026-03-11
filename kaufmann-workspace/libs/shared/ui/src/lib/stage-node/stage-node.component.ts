import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HitoTracking } from '@kaufmann/shared/models';

@Component({
  selector: 'kf-stage-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative flex flex-col items-center cursor-pointer group"
      (click)="nodeClick.emit(hito().id)"
      [attr.aria-label]="hito().name + ' - ' + hito().status"
    >
      <!-- Node circle -->
      <div [class]="nodeClass()">
        <ng-container [ngSwitch]="hito().status">
          <svg *ngSwitchCase="'completed'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg *ngSwitchCase="'delayed'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01" />
          </svg>
          <svg *ngSwitchCase="'active'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
          <svg *ngSwitchDefault class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="5" stroke-width="2" />
          </svg>
        </ng-container>
      </div>
      <!-- Pulse ring for active/delayed -->
      <div *ngIf="hito().status === 'active' || hito().status === 'delayed'"
           [class]="ringClass()"
      ></div>
      <!-- Label -->
      <span class="mt-2 text-xs font-medium text-slate-600 whitespace-nowrap">
        {{ hito().name }}
      </span>
      <!-- Tooltip on hover -->
      <div class="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-white rounded-lg shadow-md border border-slate-200 p-3 min-w-48 text-xs">
        <p class="font-semibold text-slate-800 mb-1">{{ hito().name }}</p>
        <div class="space-y-1 text-slate-600">
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
      </div>
    </div>
  `,
})
export class StageNodeComponent {
  hito = input.required<HitoTracking>();
  nodeClick = output<string>();

  formatD(d: string | null): string {
    if (!d) return '-';
    const date = new Date(d);
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date);
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
