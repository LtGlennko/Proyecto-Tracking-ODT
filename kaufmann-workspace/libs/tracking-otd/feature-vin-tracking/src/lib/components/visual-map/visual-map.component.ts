import { Component, computed, input, output } from '@angular/core';
import { HitoTracking } from '@kaufmann/shared/models';
import { LucideAngularModule } from 'lucide-angular';

interface HitoNode {
  id: string;
  nombre: string;
  icono: string | null;
  status: string;
  subetapas: { name: string; fecha: string; esPlan: boolean; status: string }[];
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
    <div class="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">

      @if (bloques().length === 0) {
        <div class="py-8 text-center text-slate-400 text-sm">Sin hitos configurados</div>
      } @else {

        <!-- Swimlane layout -->
        <div class="relative flex items-stretch min-w-max">

          <!-- Lane labels -->
          <div class="flex flex-col shrink-0 w-24 pr-3">
            <div class="flex-1 flex items-center">
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-200">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span class="text-[10px] font-semibold text-blue-700 uppercase tracking-wide whitespace-nowrap">Financiero</span>
              </div>
            </div>
            <div class="flex-1 flex items-center">
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span class="text-[10px] font-semibold text-amber-700 uppercase tracking-wide whitespace-nowrap">Operativo</span>
              </div>
            </div>
          </div>

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
                  <div class="flex flex-col items-center shrink-0">
                    <div class="flex flex-col items-center h-16">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all"
                           [class]="circleClass(hito.status, 'financiero')"
                           (click)="nodeClick.emit(hito.id)">
                        @if (hito.icono) {
                          <lucide-icon [name]="hito.icono" [size]="16" [strokeWidth]="2.5"></lucide-icon>
                        } @else {
                          <span class="text-xs">{{ statusIcon(hito.status) }}</span>
                        }
                      </div>
                      <span class="mt-1 text-xs font-semibold text-slate-700 text-center leading-tight max-w-24">
                        {{ hito.nombre }}
                      </span>
                    </div>
                    @if (hito.subetapas.length > 0) {
                      <div class="w-full bg-blue-50/50 rounded border border-blue-100 px-1.5 py-1 max-w-32">
                        @for (sub of hito.subetapas; track sub.name) {
                          <div class="flex items-center gap-1 py-px">
                            <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="subDotClass(sub.status)"></span>
                            <span class="text-[10px] text-slate-600 leading-tight truncate flex-1" [title]="sub.name">{{ sub.name }}</span>
                            @if (sub.fecha) {
                              <span class="text-[9px] font-mono whitespace-nowrap" [class]="sub.esPlan ? 'text-blue-500' : 'text-emerald-600'">{{ sub.fecha }}</span>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                  @if (!hlast) {
                    <div class="flex items-center shrink-0 mx-0.5 mt-3">
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
                  <div class="flex flex-col items-center shrink-0">
                    <div class="flex flex-col items-center h-16">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-amber-400 transition-all"
                           [class]="circleClass(hito.status, 'operativo')"
                           (click)="nodeClick.emit(hito.id)">
                        @if (hito.icono) {
                          <lucide-icon [name]="hito.icono" [size]="16" [strokeWidth]="2.5"></lucide-icon>
                        } @else {
                          <span class="text-xs">{{ statusIcon(hito.status) }}</span>
                        }
                      </div>
                      <span class="mt-1 text-xs font-semibold text-slate-700 text-center leading-tight max-w-24">
                        {{ hito.nombre }}
                      </span>
                    </div>
                    @if (hito.subetapas.length > 0) {
                      <div class="w-full bg-amber-50/50 rounded border border-amber-100 px-1.5 py-1 max-w-32">
                        @for (sub of hito.subetapas; track sub.name) {
                          <div class="flex items-center gap-1 py-px">
                            <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="subDotClass(sub.status)"></span>
                            <span class="text-[10px] text-slate-600 leading-tight truncate flex-1" [title]="sub.name">{{ sub.name }}</span>
                            @if (sub.fecha) {
                              <span class="text-[9px] font-mono whitespace-nowrap" [class]="sub.esPlan ? 'text-blue-500' : 'text-emerald-600'">{{ sub.fecha }}</span>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                  @if (!hlast) {
                    <div class="flex items-center shrink-0 mx-0.5 mt-3">
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
          <div class="absolute left-24 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 pointer-events-none"></div>
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
  nodeClick = output<string>();

  bloques = computed(() => {
    const stages = this.stages();
    const grupoMap = new Map<number, HitoTracking[]>();

    for (const h of stages) {
      const gid = h.grupoParaleloId ?? 0;
      if (!grupoMap.has(gid)) grupoMap.set(gid, []);
      grupoMap.get(gid)!.push(h);
    }

    const toNode = (h: HitoTracking): HitoNode => ({
      id: h.id,
      nombre: h.name,
      icono: h.icono || null,
      status: h.status,
      subetapas: h.subStages.map(s => {
        const real = s.real?.start ? this.fmtShort(s.real.start) : '';
        const plan = s.plan?.start ? this.fmtShort(s.plan.start) : '';
        return {
          name: s.name,
          fecha: real || plan,
          esPlan: !real && !!plan,
          status: s.status,
        };
      }),
    });

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

  subDotClass(status: string): string {
    if (status === 'completed') return 'bg-emerald-500';
    if (status === 'active') return 'bg-blue-500';
    return 'bg-slate-300';
  }

  private fmtShort(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
}
