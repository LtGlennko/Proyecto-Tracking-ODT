import { Component, computed, input } from '@angular/core';


export type StatusValue = 'A TIEMPO' | 'DEMORADO' | 'ENTREGADO' | 'ACTIVO' | 'PENDIENTE';

@Component({
    selector: 'kf-status-badge',
    imports: [],
    template: `
    <span [class]="badgeClass()" role="status">
      <span
        class="w-1.5 h-1.5 rounded-full inline-block mr-1.5 flex-shrink-0"
        [class]="dotClass()"
      ></span>
      {{ status() }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input.required<StatusValue>();

  badgeClass = computed(() => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border';
    switch (this.status()) {
      case 'A TIEMPO':   return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
      case 'DEMORADO':   return `${base} bg-red-50 text-red-700 border-red-200`;
      case 'ENTREGADO': return `${base} bg-slate-50 text-slate-600 border-slate-200`;
      case 'ACTIVO':     return `${base} bg-blue-50 text-blue-700 border-blue-200`;
      default:           return `${base} bg-slate-100 text-slate-500 border-slate-200`;
    }
  });

  dotClass = computed(() => {
    switch (this.status()) {
      case 'A TIEMPO':   return 'bg-emerald-500';
      case 'DEMORADO':   return 'bg-red-500 animate-pulse';
      case 'ENTREGADO': return 'bg-slate-400';
      case 'ACTIVO':     return 'bg-blue-500 animate-pulse';
      default:           return 'bg-slate-300';
    }
  });
}
