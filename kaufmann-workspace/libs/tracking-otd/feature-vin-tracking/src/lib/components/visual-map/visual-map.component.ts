import { Component, computed, input, output, signal } from '@angular/core';
import { HitoTracking } from '@kaufmann/shared/models';
import { resolveSubFecha } from '@kaufmann/shared/utils';
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
    <div class="bg-white rounded-lg border border-slate-200 p-3 sm:p-6 overflow-x-auto">

      @if (bloques().length === 0) {
        <div class="py-8 text-center text-slate-400 text-sm">Sin hitos configurados</div>
      } @else {

        <!-- Swimlane layout -->
        <div class="relative flex items-stretch min-w-max">


          @for (bloque of bloques(); track bloque.grupoId; let first = $first; let i = $index) {

            <!-- Separator between groups: dashed line + arrows per carril -->
            @if (!first) {
              @let prevBloque = bloques()[i - 1];
              <div class="shrink-0 relative" style="width: 36px; align-self: stretch">
                <!-- Dashed vertical line (full height, always visible) -->
                <div class="absolute inset-0 flex justify-center pointer-events-none">
                  <div class="w-px h-full" style="background:repeating-linear-gradient(to bottom,#cbd5e1 0,#cbd5e1 8px,transparent 8px,transparent 20px)"></div>
                </div>
                <!-- Top carril arrow: centered to badge height -->
                @if (prevBloque.financiero.length > 0 && bloque.financiero.length > 0) {
                  <div class="absolute left-0 right-0 flex justify-center" style="top: 12px; height: 56px; align-items: center">
                    <div class="flex items-center bg-white px-0.5">
                      <div class="w-5 h-[3px] bg-flow-arrow rounded-full"></div>
                      <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-flow-arrow"></div>
                    </div>
                  </div>
                }
                <!-- Bottom carril arrow: positioned at operativo lane -->
                @if (prevBloque.operativo.length > 0 && bloque.operativo.length > 0) {
                  <div class="absolute left-0 right-0 flex justify-center" style="bottom: 16px; height: 56px; align-items: center">
                    <div class="flex items-center bg-white px-0.5">
                      <div class="w-5 h-[3px] bg-flow-arrow rounded-full"></div>
                      <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-flow-arrow"></div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Group column -->
            <div class="flex flex-col shrink-0 min-w-28">

              <!-- Financiero lane (top) -->
              <div class="flex-1 flex items-start justify-center px-3 pt-3 pb-4">
                @for (hito of bloque.financiero; track hito.id; let hlast = $last) {
                  <div class="flex flex-col items-center shrink-0 relative w-20"
                       (mouseenter)="onHitoHover(hito.id, $event)"
                       (mouseleave)="hoveredHitoId.set(null)">
                    <div class="flex flex-col items-center">
                      <div class="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all"
                           [class]="circleClass(hito.status, 'financiero')"
                           (click)="nodeClick.emit(hito.id)">
                        @if (hito.icono) {
                          <lucide-icon [name]="hito.icono" [size]="26" [strokeWidth]="2.5"></lucide-icon>
                        } @else {
                          <span class="text-sm">{{ statusIcon(hito.status) }}</span>
                        }
                      </div>
                      <span class="mt-1.5 text-sm font-semibold text-slate-700 text-center leading-tight max-w-32">
                        {{ hito.nombre }}
                      </span>
                      @if (hito.lastDate) {
                        <span class="text-[9px] font-mono mt-0.5" [class]="hito.lastDateEsPlan ? 'text-st-active' : 'text-st-ontime'">{{ hito.lastDate }}</span>
                      }
                    </div>
                    <!-- Hover card -->
                    @if (hoveredHitoId() === hito.id && hito.subetapas.length > 0) {
                      <div class="fixed -translate-x-1/2 z-[100] bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-56 max-w-[90vw] sm:max-w-72 pointer-events-none"
                           [style.left.px]="hoverPos().x" [style.top.px]="hoverPos().y">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-xs font-bold text-slate-800">{{ hito.nombre }}</span>
                          <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full" [class]="statusLabelClass(hito.status)">{{ statusLabel(hito.status) }}</span>
                        </div>
                        <div class="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1 items-center">
                          @for (sub of hito.subetapas; track sub.name) {
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="subDotClass(sub.status)"></span>
                              <span class="text-[11px] text-slate-600">{{ sub.name }}</span>
                            </div>
                            <span class="px-1 py-0.5 text-[9px] font-medium rounded text-center whitespace-nowrap" [class]="subStatusBadgeClass(sub.status)">{{ subStatusLabel(sub.status) }}</span>
                            @if (sub.fecha) {
                              <span class="text-[10px] font-mono whitespace-nowrap text-right" [class]="sub.esPlan ? 'text-st-active' : 'text-st-ontime'">{{ sub.fecha }}</span>
                            } @else {
                              <span></span>
                            }
                          }
                        </div>
                        @if (hito.lastPlanDate) {
                          <div class="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                            Plan: <span class="font-medium text-st-active">{{ hito.lastPlanDate }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  @if (!hlast) {
                    <div class="shrink-0 mx-1 flex items-center" style="padding-top: 0; height: 56px">
                      <div class="flex items-center">
                        <div class="w-5 h-[3px] bg-flow-arrow rounded-full"></div>
                        <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-flow-arrow"></div>
                      </div>
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
              <div class="flex-1 flex items-start justify-center px-3 pt-3 pb-4">
                @for (hito of bloque.operativo; track hito.id; let hlast = $last) {
                  <div class="flex flex-col items-center shrink-0 relative w-20"
                       (mouseenter)="onHitoHover(hito.id, $event)"
                       (mouseleave)="hoveredHitoId.set(null)">
                    <div class="flex flex-col items-center">
                      <div class="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all"
                           [class]="circleClass(hito.status, 'financiero')"
                           (click)="nodeClick.emit(hito.id)">
                        @if (hito.icono) {
                          <lucide-icon [name]="hito.icono" [size]="26" [strokeWidth]="2.5"></lucide-icon>
                        } @else {
                          <span class="text-sm">{{ statusIcon(hito.status) }}</span>
                        }
                      </div>
                      <span class="mt-1.5 text-sm font-semibold text-slate-700 text-center leading-tight max-w-32">
                        {{ hito.nombre }}
                      </span>
                      @if (hito.lastDate) {
                        <span class="text-[9px] font-mono mt-0.5" [class]="hito.lastDateEsPlan ? 'text-st-active' : 'text-st-ontime'">{{ hito.lastDate }}</span>
                      }
                    </div>
                    <!-- Hover card -->
                    @if (hoveredHitoId() === hito.id && hito.subetapas.length > 0) {
                      <div class="fixed -translate-x-1/2 z-[100] bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-56 max-w-[90vw] sm:max-w-72 pointer-events-none"
                           [style.left.px]="hoverPos().x" [style.top.px]="hoverPos().y">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-xs font-bold text-slate-800">{{ hito.nombre }}</span>
                          <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full" [class]="statusLabelClass(hito.status)">{{ statusLabel(hito.status) }}</span>
                        </div>
                        <div class="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1 items-center">
                          @for (sub of hito.subetapas; track sub.name) {
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="subDotClass(sub.status)"></span>
                              <span class="text-[11px] text-slate-600">{{ sub.name }}</span>
                            </div>
                            <span class="px-1 py-0.5 text-[9px] font-medium rounded text-center whitespace-nowrap" [class]="subStatusBadgeClass(sub.status)">{{ subStatusLabel(sub.status) }}</span>
                            @if (sub.fecha) {
                              <span class="text-[10px] font-mono whitespace-nowrap text-right" [class]="sub.esPlan ? 'text-st-active' : 'text-st-ontime'">{{ sub.fecha }}</span>
                            } @else {
                              <span></span>
                            }
                          }
                        </div>
                        @if (hito.lastPlanDate) {
                          <div class="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                            Plan: <span class="font-medium text-st-active">{{ hito.lastPlanDate }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  @if (!hlast) {
                    <div class="shrink-0 mx-1 flex items-center" style="padding-top: 0; height: 56px">
                      <div class="flex items-center">
                        <div class="w-5 h-[3px] bg-flow-arrow rounded-full"></div>
                        <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-flow-arrow"></div>
                      </div>
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
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-st-ontime"></span> Completado</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-st-delayed"></span> Demorado</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full border-2 border-st-active bg-st-active-light"></span> Activo</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-st-pending-border"></span> Pendiente</span>
          <span class="flex items-center gap-1.5">
            <span class="h-3" style="background:repeating-linear-gradient(to bottom,#94a3b8 0,#94a3b8 4px,transparent 4px,transparent 10px);width:1px;display:inline-block"></span> Grupo paralelo
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
  hoverPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  onHitoHover(hitoId: number, event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.hoverPos.set({ x: rect.left + rect.width / 2, y: rect.bottom + 4 });
    this.hoveredHitoId.set(hitoId);
  }

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
        const sf = resolveSubFecha(s.real, s.plan);
        return { name: s.name, fecha: sf.raw ? this.fmtShort(sf.raw) : '', esPlan: sf.esPlan, status: s.status };
      });

      let lastDate = '';
      let lastDateEsPlan = false;
      for (let i = h.subStages.length - 1; i >= 0; i--) {
        const sf = resolveSubFecha(h.subStages[i].real, h.subStages[i].plan);
        if (sf.raw) { lastDate = this.fmtShort(sf.raw); lastDateEsPlan = sf.esPlan; break; }
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

  circleClass(status: string, _carril?: string): string {
    if (status === 'completed') return 'border-st-ontime bg-st-ontime-light text-st-ontime';
    if (status === 'delayed') return 'border-st-delayed bg-st-delayed-light text-st-delayed';
    if (status === 'active') return 'border-st-active bg-st-active-light text-st-active animate-pulse';
    return 'border-st-pending bg-st-pending-light text-st-pending';
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
      case 'completed': return 'text-st-ontime bg-st-ontime-light';
      case 'delayed': return 'text-st-delayed bg-st-delayed-light';
      case 'active': return 'text-st-active bg-st-active-light';
      default: return 'text-st-pending bg-st-pending-light';
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
      case 'completed': return 'bg-st-ontime-light text-st-ontime';
      case 'completed-risk': return 'bg-st-risk-light text-st-risk';
      case 'completed-late': return 'bg-st-delayed-light text-st-delayed';
      case 'on-time': return 'bg-st-pending-light text-st-pending';
      case 'at-risk': return 'bg-st-risk-light text-st-risk';
      case 'delayed': return 'bg-st-delayed-light text-st-delayed';
      default: return 'bg-st-pending-light text-st-pending';
    }
  }

  subDotClass(status: string): string {
    if (status === 'completed') return 'bg-st-ontime';
    if (status === 'completed-risk') return 'bg-st-risk';
    if (status === 'completed-late') return 'bg-st-delayed';
    if (status === 'at-risk') return 'bg-st-risk animate-pulse';
    if (status === 'delayed') return 'bg-st-delayed animate-pulse';
    return 'bg-st-pending';
  }

  private fmtShort(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
  }
}
