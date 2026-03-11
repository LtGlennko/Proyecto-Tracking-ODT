import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kf-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex items-start gap-4"
         [style.border-left-color]="color()"
         style="border-left-width: 4px;">
      <div class="flex-1 min-w-0">
        <p class="text-sm text-slate-500 font-medium truncate">{{ title() }}</p>
        <div class="mt-1 flex items-baseline gap-1.5">
          <span class="text-2xl font-bold text-slate-800">{{ value() }}</span>
          <span *ngIf="unit()" class="text-sm text-slate-500">{{ unit() }}</span>
        </div>
        <div *ngIf="trendLabel()" class="mt-1.5 flex items-center gap-1 text-xs">
          <span [class]="trendClass()">
            {{ trend()! > 0 ? '↑' : trend()! < 0 ? '↓' : '→' }}
            {{ trendLabel() }}
          </span>
        </div>
      </div>
      <div *ngIf="icon()" class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
           [style.background-color]="color() + '1A'">
        <span class="text-xl">{{ icon() }}</span>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  unit = input<string>();
  trend = input<number>();
  trendLabel = input<string>();
  color = input<string>('#2E75B6');
  icon = input<string>();

  trendClass = () => {
    const t = this.trend() ?? 0;
    if (t > 0) return 'text-red-600';
    if (t < 0) return 'text-emerald-600';
    return 'text-slate-500';
  };
}
