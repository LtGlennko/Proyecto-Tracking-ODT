import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HitoTracking } from '@kaufmann/shared/models';
import { formatDate } from '@kaufmann/shared/utils';

interface GanttBar {
  type: 'baseline' | 'plan' | 'real';
  startPct: number;
  widthPct: number;
  color: string;
}

@Component({
  selector: 'kf-gantt-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border border-slate-200 p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-slate-700">Vista Gantt</h3>
        <div class="flex gap-3 text-xs">
          <span class="flex items-center gap-1"><span class="w-4 h-1.5 rounded bg-slate-300 inline-block"></span> Baseline</span>
          <span class="flex items-center gap-1"><span class="w-4 h-1.5 rounded bg-blue-400 inline-block"></span> Plan</span>
          <span class="flex items-center gap-1"><span class="w-4 h-1.5 rounded bg-emerald-400 inline-block"></span> Real</span>
        </div>
      </div>

      <!-- Date axis -->
      <div class="flex mb-2 ml-32">
        <div *ngFor="let tick of dateTicks()" class="flex-1 text-center text-[10px] text-slate-400 border-l border-slate-100">
          {{ tick }}
        </div>
      </div>

      <!-- Rows -->
      <div class="space-y-2">
        <div *ngFor="let hito of stages()">
          <!-- Hito row -->
          <div class="flex items-center gap-2">
            <div class="w-32 flex-shrink-0">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full flex-shrink-0"
                  [class]="hito.status === 'completed' ? 'bg-emerald-500' :
                           hito.status === 'delayed'   ? 'bg-red-500' :
                           hito.status === 'active'    ? 'bg-blue-500' : 'bg-slate-300'">
                </span>
                <span class="text-xs font-medium text-slate-700 truncate">{{ hito.name }}</span>
              </div>
            </div>
            <div class="flex-1 h-6 relative bg-slate-50 rounded overflow-hidden border border-slate-100">
              <!-- Baseline bar -->
              <div *ngIf="getBar(hito, 'baseline') as bar"
                   class="absolute top-1 h-1 rounded opacity-50"
                   [style.left]="bar.startPct + '%'"
                   [style.width]="bar.widthPct + '%'"
                   [class]="bar.color">
              </div>
              <!-- Plan bar -->
              <div *ngIf="getBar(hito, 'plan') as bar"
                   class="absolute top-2.5 h-1.5 rounded"
                   [style.left]="bar.startPct + '%'"
                   [style.width]="bar.widthPct + '%'"
                   [class]="bar.color">
              </div>
              <!-- Real bar -->
              <div *ngIf="getBar(hito, 'real') as bar"
                   class="absolute bottom-1 h-1.5 rounded"
                   [style.left]="bar.startPct + '%'"
                   [style.width]="bar.widthPct + '%'"
                   [class]="bar.color">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class GanttViewComponent {
  stages = input.required<HitoTracking[]>();

  readonly formatDate = formatDate;

  range = computed(() => {
    const allDates: Date[] = [];
    for (const s of this.stages()) {
      if (s.baseline.start) allDates.push(new Date(s.baseline.start));
      if (s.real.end)        allDates.push(new Date(s.real.end));
      if (s.plan.end)        allDates.push(new Date(s.plan.end));
    }
    if (allDates.length === 0) return { min: new Date(), max: new Date(), spanDays: 1 };
    const min = new Date(Math.min(...allDates.map(d => d.getTime())));
    const max = new Date(Math.max(...allDates.map(d => d.getTime())));
    const spanDays = Math.max(1, Math.ceil((max.getTime() - min.getTime()) / 86400000));
    return { min, max, spanDays };
  });

  dateTicks = computed(() => {
    const { min, spanDays } = this.range();
    const ticks: string[] = [];
    const step = Math.ceil(spanDays / 5);
    for (let i = 0; i <= 5; i++) {
      const d = new Date(min);
      d.setDate(d.getDate() + i * step);
      ticks.push(formatDate(d.toISOString().split('T')[0]));
    }
    return ticks;
  });

  toPct(dateStr: string | null): number {
    if (!dateStr) return 0;
    const { min, spanDays } = this.range();
    const d = new Date(dateStr);
    return Math.max(0, Math.min(100, ((d.getTime() - min.getTime()) / (spanDays * 86400000)) * 100));
  }

  getBar(hito: HitoTracking, type: 'baseline' | 'plan' | 'real'): GanttBar | null {
    const set = hito[type];
    if (!set.start && !set.end) return null;
    const start = set.start ?? set.end!;
    const end = set.end ?? set.start!;
    const startPct = this.toPct(start);
    const widthPct = Math.max(0.5, this.toPct(end) - startPct);
    const colorMap = {
      baseline: 'bg-slate-300',
      plan: 'bg-blue-400',
      real: hito.status === 'delayed' ? 'bg-red-400' : 'bg-emerald-400',
    };
    return { type, startPct, widthPct, color: colorMap[type] };
  }
}
