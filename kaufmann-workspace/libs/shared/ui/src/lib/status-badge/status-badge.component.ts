import { Component, computed, input } from '@angular/core';


export type StatusValue = 'A TIEMPO' | 'EN RIESGO' | 'DEMORADO' | 'ENTREGADO' | 'ACTIVO' | 'PENDIENTE';

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
      case 'A TIEMPO':   return `${base} bg-st-ontime-light text-st-ontime border-st-ontime-border`;
      case 'EN RIESGO':  return `${base} bg-st-risk-light text-st-risk border-st-risk-border`;
      case 'DEMORADO':   return `${base} bg-st-delayed-light text-st-delayed border-st-delayed-border`;
      case 'ENTREGADO':  return `${base} bg-st-done-light text-st-done border-st-done-border`;
      case 'ACTIVO':     return `${base} bg-st-active-light text-st-active border-st-active-border`;
      default:           return `${base} bg-st-pending-light text-st-pending border-st-pending-border`;
    }
  });

  dotClass = computed(() => {
    switch (this.status()) {
      case 'A TIEMPO':   return 'bg-st-ontime';
      case 'EN RIESGO':  return 'bg-st-risk animate-pulse';
      case 'DEMORADO':   return 'bg-st-delayed animate-pulse';
      case 'ENTREGADO':  return 'bg-st-done';
      case 'ACTIVO':     return 'bg-st-active animate-pulse';
      default:           return 'bg-st-pending';
    }
  });
}
