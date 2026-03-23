import { Component, computed, input, output, signal } from '@angular/core';
import { HitoTracking } from '@kaufmann/shared/models';
import { LucideAngularModule } from 'lucide-angular';

interface SubNode {
  name: string;
  fecha: string;
  esPlan: boolean;
  status: string;
}

interface HitoNode {
  id: number;
  nombre: string;
  icono: string | null;
  status: string;
  lastDate: string;
  lastDateEsPlan: boolean;
  lastPlanDate: string;
  subetapas: SubNode[];
}

interface Bloque {
  grupoId: number;
  financiero: HitoNode[];
  operativo: HitoNode[];
}

@Component({
    selector: 'kf-visual-map',
    imports: [LucideAngularModule],
    template: `
    <div class="bg-white rounded-lg border border-slate-200 p-6 overflow-visible">

      @if (bloques().length === 0) {
        <div class="py-8 text-center text-slate-400 text-sm">Sin hitos configurados</div>
      } @else {

        <!-- Swimlane layout -->
        <div class="relative flex items-stretch min-w-max">


          @for (bloque of bloques(); track bloque.grupoId; let first = $first) {

            <!-- Dashed separator between groups -->
            @if (!first) {
              <div class="flex items-stretch justify-center shrink-0 px-5">
                <div class="border-l-2 border-dashed border-slate-300"></div>
              </div>
            }

            <!-- Group column -->
            <div class="flex flex-col shrink-0 min-w-28">

              <!-- Financiero lane (top) -->
              <div class="flex-1 flex items-start justify-center gap-1 px-3 pt-3 pb-4">
                @for (hito of bloque.financiero; track hito.id; let hlast = $last) {
                  <div class="flex flex-col items-center shrink-0 relative"
                       (mouseenter)="hoveredHitoId.set(hito.id)"
                       (mouseleave)="hoveredHitoId.set(null)">
                    <div class="flex flex-col items-center">
                      <div class="w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all"
                           [class]="circleClass(hito.status, 'financiero')"
                           (click)="nodeClick.emit(hito.id)">
                        @if (hito.icono) {
                          <lucide-icon [name]="hito.icono" [size]="22" [strokeWidth]="2.5"></lucide-icon>
                        } @else {
                          <span class="text-sm">{{ statusIcon(hito.status) }}</span>
                        }
                      </div>
                      <span class="mt-1 text-sm font-semibold text-slate-700 text-center leading-tight max-w-28">
                        {{ hito.nombre }}
                      </span>
                      @if (hito.lastDate) {
                        <span class="text-[9px] font-mono mt-0.5" [class]="hito.lastDateEsPlan ? 'text-blue-500' : 'text-emerald-600'">{{ hito.lastDate }}</span>
                      }
                    </div>
                    <!-- Hover card -->
                    @if (hoveredHitoId() === hito.id && hito.subetapas.length > 0) {
                      <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-48 max-w-56 pointer-events-none">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-xs font-bold text-slate-800">{{ hito.nombre }}</span>
                          <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full" [class]="statusLabelClass(hito.status)">{{ statusLabel(hito.status) }}</span>
                        </div>
                        <div class="space-y-1">
                          @for (sub of hito.subetapas; track sub.name) {
                            <div class="flex items-center justify-between gap-1.5">
                              <div class="flex items-center gap-1.5 min-w-0 flex-1">
                                <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="subDotClass(sub.status)"></span>
                                <span class="text-[11px] text-slate-600 truncate">{{ sub.name }}</span>
                              </div>
                              <span class="px-1 py-0.5 text-[9px] font-medium rounded shrink-0" [class]="subStatusBadgeClass(sub.status)">{{ subStatusLabel(sub.status) }}</span>
                              @if (sub.fecha) {
                                <span class="text-[10px] font-mono whitespace-nowrap shrink-0" [class]="sub.esPlan ? 'text-blue-500' : 'text-emerald-600'">{{ sub.fecha }}</span>
                              }
                            </div>
                          }
                        </div>
                        @if (hito.lastPlanDate) {
                          <div class="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                            Plan: <span class="font-medium text-blue-500">{{ hito.lastPlanDate }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  @if (!hlast) {
                    <div class="flex items-center shrink-0 mx-0.5 mt-4">
                      <div class="w-3 h-0.5 bg-blue-300"></div>
                      <div class="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-transparent border-l-blue-300"></div>
                    </div>
                  }
                }
                @if (bloque.financiero.length === 0) {
                  <div class="flex items-center justify-center h-16 w-full">
                    <span class="text-slate-200 text-xs">—</span>
                  </div>
                }
              </div>

              <!-- Operativo lane (bottom) -->
              <div class="flex-1 flex items-start justify-center gap-1 px-3 pt-3 pb-4">
                @for (hito of bloque.operativo; track hito.id; let hlast = $last) {
                  <div class="flex flex-col items-center shrink-0 relative"
                       (mouseenter)="hoveredHitoId.set(hito.id)"
                       (mouseleave)="hoveredHitoId.set(null)">
                    <div class="flex flex-col items-center">
                      <div class="w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-amber-400 transition-all"
                           [class]="circleClass(hito.status, 'operativo')"
                           (click)="nodeClick.emit(hito.id)">
                        @if (hito.icono) {
                          <lucide-icon [name]="hito.icono" [size]="22" [strokeWidth]="2.5"></lucide-icon>
                        } @else {
                          <span class="text-sm">{{ statusIcon(hito.status) }}</span>
                        }
                      </div>
                      <span class="mt-1 text-sm font-semibold text-slate-700 text-center leading-tight max-w-28">
                        {{ hito.nombre }}
                      </span>
                      @if (hito.lastDate) {
                        <span class="text-[9px] font-mono mt-0.5" [class]="hito.lastDateEsPlan ? 'text-blue-500' : 'text-emerald-600'">{{ hito.lastDate }}</span>
                      }
                    </div>
                    <!-- Hover card -->
                    @if (hoveredHitoId() === hito.id && hito.subetapas.length > 0) {
                      <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-48 max-w-56 pointer-events-none">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-xs font-bold text-slate-800">{{ hito.nombre }}</span>
                          <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full" [class]="statusLabelClass(hito.status)">{{ statusLabel(hito.status) }}</span>
                        </div>
                        <div class="space-y-1">
                          @for (sub of hito.subetapas; track sub.name) {
                            <div class="flex items-center justify-between gap-1.5">
                              <div class="flex items-center gap-1.5 min-w-0 flex-1">
                                <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="subDotClass(sub.status)"></span>
                                <span class="text-[11px] text-slate-600 truncate">{{ sub.name }}</span>
                              </div>
                              <span class="px-1 py-0.5 text-[9px] font-medium rounded shrink-0" [class]="subStatusBadgeClass(sub.status)">{{ subStatusLabel(sub.status) }}</span>
                              @if (sub.fecha) {
                                <span class="text-[10px] font-mono whitespace-nowrap shrink-0" [class]="sub.esPlan ? 'text-blue-500' : 'text-emerald-600'">{{ sub.fecha }}</span>
                              }
                            </div>
                          }
                        </div>
                        @if (hito.lastPlanDate) {
                          <div class="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                            Plan: <span class="font-medium text-blue-500">{{ hito.lastPlanDate }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  @if (!hlast) {
                    <div class="flex items-center shrink-0 mx-0.5 mt-4">
                      <div class="w-3 h-0.5 bg-amber-300"></div>
                      <div class="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-transparent border-l-amber-300"></div>
                    </div>
                  }
                }
                @if (bloque.operativo.length === 0) {
                  <div class="flex items-center justify-center h-16 w-full">
                    <span class="text-slate-200 text-xs">—</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Center lane separator -->
          <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 pointer-events-none"></div>
        </div>

        <!-- Legend -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Completado</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"></span> Demorado</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-50"></span> Activo</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-200"></span> Pendiente</span>
          <span class="flex items-center gap-1.5">
            <span class="w-5 border-l-2 border-dashed border-slate-400 h-3"></span> Grupo paralelo
          </span>
        </div>
      }
    </div>
    `
})
export class VisualMapComponent {
  stages = input.required<HitoTracking[]>();
  nodeClick = output<number>();
  hoveredHitoId = signal<number | null>(null);

  bloques = computed(() => {
    const stages = this.stages();
    const grupoMap = new Map<number, HitoTracking[]>();

    for (const h of stages) {
      const gid = h.grupoParaleloId ?? 0;
      if (!grupoMap.has(gid)) grupoMap.set(gid, []);
      grupoMap.get(gid)!.push(h);
    }

    const toNode = (h: HitoTracking): HitoNode => {
      const subs: SubNode[] = h.subStages.map((s: any) => {
        const real = s.real?.start ? this.fmtShort(s.real.start) : '';
        const plan = s.plan?.start ? this.fmtShort(s.plan.start) : '';
        return { name: s.name, fecha: real || plan, esPlan: !real && !!plan, status: s.status };
      });

      let lastDate = '';
      let lastDateEsPlan = false;
      for (let i = h.subStages.length - 1; i >= 0; i--) {
        const s = h.subStages[i];
        const real = s.real?.start ? this.fmtShort(s.real.start) : '';
        const plan = s.plan?.start ? this.fmtShort(s.plan.start) : '';
        if (real) { lastDate = real; lastDateEsPlan = false; break; }
        if (plan) { lastDate = plan; lastDateEsPlan = true; break; }
      }

      let lastPlanDate = '';
      for (let i = h.subStages.length - 1; i >= 0; i--) {
        const p = h.subStages[i].plan?.end || h.subStages[i].plan?.start;
        if (p) { lastPlanDate = this.fmtShort(p); break; }
      }

      return {
        id: h.id, nombre: h.name, icono: h.icono || null, status: h.status,
        lastDate, lastDateEsPlan, lastPlanDate, subetapas: subs,
      };
    };

    const bloques: (Bloque & { minIdx: number })[] = [];
    let idx = 0;
    for (const [gid, hitos] of grupoMap) {
      bloques.push({
        grupoId: gid,
        minIdx: idx,
        financiero: hitos.filter(h => h.carril === 'financiero').map(toNode),
        operativo: hitos.filter(h => h.carril !== 'financiero').map(toNode),
      });
      idx++;
    }

    return bloques
      .filter(b => b.financiero.length > 0 || b.operativo.length > 0)
      .sort((a, b) => a.minIdx - b.minIdx);
  });

  circleClass(status: string, carril: string): string {
    if (status === 'completed') return 'border-emerald-500 bg-emerald-50 text-emerald-600';
    if (status === 'delayed') return 'border-red-500 bg-red-50 text-red-600';
    if (status === 'active') return carril === 'financiero'
      ? 'border-blue-400 bg-blue-50 text-blue-500 animate-pulse'
      : 'border-amber-400 bg-amber-50 text-amber-500 animate-pulse';
    return 'border-slate-300 bg-slate-50 text-slate-400';
  }

  statusIcon(status: string): string {
    if (status === 'completed') return '\u2713';
    if (status === 'delayed') return '!';
    if (status === 'active') return '\u25CF';
    return '\u25CB';
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'delayed': return 'Demorado';
      case 'active': return 'En curso';
      default: return 'Pendiente';
    }
  }

  statusLabelClass(status: string): string {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-500 bg-slate-100';
    }
  }

  subStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'A tiempo';
      case 'completed-risk': return 'En tolerancia';
      case 'completed-late': return 'Crítico';
      case 'on-time': return 'A tiempo';
      case 'at-risk': return 'En tolerancia';
      case 'delayed': return 'Crítico';
      default: return 'Pendiente';
    }
  }

  subStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600';
      case 'completed-risk': return 'bg-amber-50 text-amber-600';
      case 'completed-late': return 'bg-red-50 text-red-600';
      case 'on-time': return 'bg-slate-50 text-slate-400';
      case 'at-risk': return 'bg-amber-50 text-amber-600';
      case 'delayed': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  }

  subDotClass(status: string): string {
    if (status === 'completed') return 'bg-emerald-500';
    if (status === 'completed-risk') return 'bg-amber-500';
    if (status === 'completed-late') return 'bg-red-500';
    if (status === 'at-risk') return 'bg-amber-500 animate-pulse';
    if (status === 'delayed') return 'bg-red-500 animate-pulse';
    return 'bg-slate-300';
  }

  private fmtShort(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
}
