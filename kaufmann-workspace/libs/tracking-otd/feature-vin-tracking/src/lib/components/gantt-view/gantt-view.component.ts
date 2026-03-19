import { Component, input, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HitoTracking, SubetapaTracking } from '@kaufmann/shared/models';

interface TimeMarker {
  label: string;
  leftPct: number;
}

@Component({
    selector: 'kf-gantt-view',
    imports: [FormsModule],
    template: `
    <!-- Date range controls -->
    <div class="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="text-sm font-medium text-slate-700">Rango de Vista:</span>
      </div>
      <div class="flex items-center gap-2">
        <input
          type="date"
          [ngModel]="viewStart()"
          (ngModelChange)="viewStart.set($event)"
          class="text-sm border border-slate-300 rounded-md px-2 py-1 text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        <span class="text-slate-400">–</span>
        <input
          type="date"
          [ngModel]="viewEnd()"
          (ngModelChange)="viewEnd.set($event)"
          class="text-sm border border-slate-300 rounded-md px-2 py-1 text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
      </div>
      <button
        (click)="resetRange()"
        class="text-xs text-slate-500 hover:text-slate-700 underline transition-colors">
        Restablecer
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto flex flex-col"
         [style.height.px]="containerHeight()">

      <div [style.min-width.px]="ganttMinWidth()">
      <!-- Header / Timeline Scale -->
      <div class="flex border-b border-slate-100 bg-white shrink-0 h-12 sticky top-0 z-20">
        <div class="w-1/4 min-w-[200px] px-4 font-bold text-slate-700 text-xs uppercase tracking-wider border-r border-slate-100 flex items-center bg-white">
          Etapas
        </div>
        <div class="flex-1 relative overflow-hidden">
          @for (m of timeMarkers(); track m.label) {
            <div class="absolute top-0 bottom-0 border-l border-slate-100 pl-2 pt-3"
                 [style.left.%]="m.leftPct">
              <span class="text-xs font-medium text-slate-400 capitalize whitespace-nowrap">{{ m.label }}</span>
            </div>
          }
          @if (todayPct() !== null) {
            <div class="absolute top-0 bottom-0 border-l border-red-400 z-10"
                 [style.left.%]="todayPct()">
              <div class="absolute top-0 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
              <div class="absolute top-2 left-1 text-[9px] font-bold text-red-500 uppercase bg-white/80 px-1 rounded shadow-sm border border-red-100">
                Hoy
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        @for (stage of stages(); track stage.id) {
          <div class="border-b border-slate-50 last:border-0">

            <!-- Macro Stage Row -->
            <div class="flex hover:bg-slate-50 transition-colors group cursor-pointer h-12"
                 (click)="toggleCollapse(stage.id)">
              <div class="w-1/4 min-w-[200px] px-4 border-r border-slate-100 flex items-center justify-between z-10 bg-white group-hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                    [class]="stage.status === 'completed' ? 'bg-emerald-500' :
                             stage.status === 'delayed'   ? 'bg-red-500' :
                             stage.status === 'active'    ? 'bg-blue-500' : 'bg-slate-300'">
                  </span>
                  <span class="font-semibold text-slate-700 text-sm truncate">{{ stage.name }}</span>
                </div>
                <svg class="w-4 h-4 text-slate-300 transition-transform flex-shrink-0"
                     [class.rotate-180]="!isCollapsed(stage.id)"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <div class="flex-1 relative flex items-center">
                <!-- Grid lines -->
                @for (m of timeMarkers(); track m.label) {
                  <div class="absolute top-0 bottom-0 border-l border-slate-50"
                       [style.left.%]="m.leftPct"></div>
                }
                @if (todayPct() !== null) {
                  <div class="absolute top-0 bottom-0 border-l border-red-100"
                       [style.left.%]="todayPct()"></div>
                }

                <!-- Plan bar (ghost) -->
                @if (getBarStyle(stage.plan.start, stage.plan.end); as planBar) {
                  <div class="absolute h-1.5 bg-slate-100 rounded-full"
                       [style.left]="planBar.left"
                       [style.width]="planBar.width"
                       [style.display]="planBar.display"></div>
                }

                <!-- Real bar -->
                <div class="absolute h-2.5 rounded-full transition-all z-10 group/bar"
                     [class]="stage.status === 'completed' ? 'bg-emerald-400' :
                              stage.status === 'delayed'   ? 'bg-red-400' :
                              stage.status === 'active'    ? 'bg-blue-400' : 'bg-slate-300'"
                     [style.left]="getBarStyle(stage.real.start, stage.real.end)?.left || '0%'"
                     [style.width]="getBarStyle(stage.real.start, stage.real.end)?.width || '0%'"
                     [style.display]="getBarStyle(stage.real.start, stage.real.end)?.display || 'none'">
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    <div class="font-bold mb-0.5">{{ stage.name }}</div>
                    <div class="opacity-80">{{ fmtShort(stage.real.start) }} – {{ fmtShort(stage.real.end) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub Stages (collapsible) -->
            @if (!isCollapsed(stage.id)) {
              <div class="bg-slate-50/30">
                @for (sub of stage.subStages; track sub.id) {
                  <div class="flex hover:bg-slate-50 transition-colors h-8">
                    <div class="w-1/4 min-w-[200px] px-4 pl-10 border-r border-slate-100 flex items-center">
                      <span class="text-xs text-slate-500 truncate">{{ sub.name }}</span>
                    </div>
                    <div class="flex-1 relative flex items-center">
                      <!-- Grid lines -->
                      @for (m of timeMarkers(); track m.label) {
                        <div class="absolute top-0 bottom-0 border-l border-slate-50"
                             [style.left.%]="m.leftPct"></div>
                      }
                      @if (todayPct() !== null) {
                        <div class="absolute top-0 bottom-0 border-l border-red-50"
                             [style.left.%]="todayPct()"></div>
                      }

                      <!-- Sub stage bar -->
                      <div class="absolute h-1.5 rounded-full opacity-70 group/subbar"
                           [class]="sub.status === 'completed' ? 'bg-emerald-300' :
                                    sub.status === 'active'    ? 'bg-blue-300' : 'bg-slate-200'"
                           [style.left]="getBarStyle(sub.real.start, sub.real.end)?.left || '0%'"
                           [style.width]="getBarStyle(sub.real.start, sub.real.end)?.width || '0%'"
                           [style.display]="getBarStyle(sub.real.start, sub.real.end)?.display || 'none'">
                        <!-- Tooltip -->
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/subbar:block bg-slate-800 text-white text-[10px] p-1.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                          <div class="font-bold mb-0.5">{{ sub.name }}</div>
                          <div class="opacity-80">{{ fmtShort(sub.real.start) }} – {{ fmtShort(sub.real.end) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      </div><!-- end min-width wrapper -->

      <!-- Legend -->
      <div class="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400 uppercase tracking-wider shrink-0">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span>Completado</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>En Curso</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 bg-red-400 rounded-full"></div>
          <span>Demorado</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-1 bg-slate-100 rounded-full"></div>
          <span>Plan</span>
        </div>
      </div>
    </div>
    `
})
export class GanttViewComponent implements OnInit {
  stages = input.required<HitoTracking[]>();

  collapsedSet = signal<Set<string>>(new Set());

  // --- User-controlled view range ---
  viewStart = signal('');
  viewEnd = signal('');

  ngOnInit(): void {
    // Initialize date inputs from data bounds
    const { min, max } = this.dataRange();
    this.viewStart.set(this.toISODate(min));
    this.viewEnd.set(this.toISODate(max));
  }

  // --- Absolute data bounds (from all dates in stages) ---

  dataRange = computed(() => {
    const allDates: number[] = [];
    const processDate = (d: string | null) => {
      if (!d) return;
      const t = new Date(d).getTime();
      if (!isNaN(t)) allDates.push(t);
    };

    for (const s of this.stages()) {
      processDate(s.baseline.start);
      processDate(s.baseline.end);
      processDate(s.plan.start);
      processDate(s.plan.end);
      processDate(s.real.start);
      processDate(s.real.end);
      for (const sub of s.subStages) {
        processDate(sub.baseline.start);
        processDate(sub.baseline.end);
        processDate(sub.real.start);
        processDate(sub.real.end);
      }
    }

    if (allDates.length === 0) {
      const now = Date.now();
      return { min: now, max: now + 86400000 };
    }

    const pad = 7 * 86400000;
    return { min: Math.min(...allDates) - pad, max: Math.max(...allDates) + pad };
  });

  // --- Active view range (user override or data bounds) ---

  range = computed(() => {
    const data = this.dataRange();
    const vs = this.viewStart();
    const ve = this.viewEnd();

    const min = vs ? new Date(vs).getTime() : data.min;
    const max = ve ? new Date(ve).getTime() : data.max;
    const span = Math.max(86400000, max - min);
    return { min, max, span };
  });

  resetRange(): void {
    const { min, max } = this.dataRange();
    this.viewStart.set(this.toISODate(min));
    this.viewEnd.set(this.toISODate(max));
  }

  private toISODate(ts: number): string {
    return new Date(ts).toISOString().split('T')[0];
  }

  // --- Weekly time markers ---

  timeMarkers = computed<TimeMarker[]>(() => {
    const { min, max, span } = this.range();
    const markers: TimeMarker[] = [];
    const current = new Date(min);

    // Align to Monday
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);

    const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' });

    while (current.getTime() <= max) {
      const t = current.getTime();
      if (t >= min - 7 * 86400000 && t <= max) {
        const leftPct = ((t - min) / span) * 100;
        if (leftPct >= -5 && leftPct <= 105) {
          markers.push({ label: fmt.format(current), leftPct });
        }
      }
      current.setDate(current.getDate() + 7);
    }
    return markers;
  });

  // --- Today line ---

  todayPct = computed<number | null>(() => {
    const { min, max, span } = this.range();
    const now = Date.now();
    if (now < min || now > max) return null;
    return ((now - min) / span) * 100;
  });

  // --- Minimum width to prevent date label overlap (80px per marker + 200px label col) ---

  ganttMinWidth = computed(() => {
    const markers = this.timeMarkers().length;
    return Math.max(700, 200 + markers * 80);
  });

  // --- Container height (dynamic based on visible rows) ---

  containerHeight = computed(() => {
    let rows = 0;
    for (const s of this.stages()) {
      rows++; // hito row
      if (!this.isCollapsed(s.id)) {
        rows += s.subStages.length;
      }
    }
    // header(48) + rows*height + legend(32) + padding
    return Math.min(600, 48 + rows * 40 + 32 + 16);
  });

  // --- Collapse toggle ---

  toggleCollapse(id: string): void {
    this.collapsedSet.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  isCollapsed(id: string): boolean {
    return this.collapsedSet().has(id);
  }

  // --- Bar position calculation ---

  getBarStyle(startStr: string | null, endStr: string | null): { left: string; width: string; display: string } | null {
    if (!startStr || !endStr) return null;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    if (isNaN(start) || isNaN(end)) return null;

    const { min, max, span } = this.range();
    if (end < min || start > max) return { left: '0%', width: '0%', display: 'none' };

    const left = ((start - min) / span) * 100;
    const width = ((end - start) / span) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(0.3, width)}%`,
      display: 'block'
    };
  }

  // --- Date formatting ---

  fmtShort(d: string | null): string {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(date);
  }
}
