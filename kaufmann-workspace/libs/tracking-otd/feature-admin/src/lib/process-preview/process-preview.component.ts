import { Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

interface HitoConfigView {
  hitoConfigId: number;
  hitoId: number;
  nombre: string;
  icono: string | null;
  carril: string;
  grupoParalelo: { id: number; nombre: string } | null;
  orden: number;
  activo: boolean;
  subetapas: SubetapaConfigView[];
}

interface SubetapaConfigView {
  subetapaConfigId: number | null;
  subetapaId: number;
  nombre: string;
  campoStagingReal: string | null;
  campoStagingPlan: string | null;
  orden: number;
  activo: boolean;
}

interface HitoNode {
  nombre: string;
  icono: string | null;
  subetapas: string[];
}

interface Bloque {
  grupoId: number;
  financiero: HitoNode[];
  operativo: HitoNode[];
}

@Component({
  selector: 'kf-process-preview',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
  <div class="bg-white rounded-lg border border-slate-200 p-3 sm:p-6 overflow-x-auto">
    <h3 class="text-sm font-semibold text-slate-700 mb-5">Vista previa del proceso</h3>

    <!-- Grid: 2 rows (financiero + operativo), N columns (label + groups with separators) -->
    <div class="grid min-w-max" [style.grid-template-columns]="gridCols()" style="grid-template-rows: auto auto;">


      @for (bloque of bloques(); track bloque.grupoId; let first = $first; let i = $index) {
        <!-- Separator (financiero row) -->
        @if (!first) {
          @let prevBloque = bloques()[i - 1];
          <div class="relative border-b border-slate-200" style="width: 36px">
            <div class="absolute inset-0 flex justify-center pointer-events-none">
              <div class="w-px h-full" style="background:repeating-linear-gradient(to bottom,#cbd5e1 0,#cbd5e1 8px,transparent 8px,transparent 20px)"></div>
            </div>
            @if (prevBloque.financiero.length > 0 && bloque.financiero.length > 0) {
              <div class="absolute left-0 right-0 flex justify-center" style="top: 12px; height: 48px; align-items: center">
                <div class="flex items-center bg-white px-0.5">
                  <div class="w-5 h-[3px] bg-blue-300 rounded-full"></div>
                  <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-blue-300"></div>
                </div>
              </div>
            }
          </div>
        }
        <!-- Financiero content -->
        <div class="flex items-start justify-center px-3 pt-3 pb-4 border-b border-slate-200">
          @for (hito of bloque.financiero; track hito.nombre; let hlast = $last) {
            <div class="flex flex-col items-center shrink-0">
              <div class="flex flex-col items-center h-20">
                <div class="w-12 h-12 rounded-full flex items-center justify-center border-2 border-blue-400 bg-blue-50 text-blue-500 shrink-0">
                  @if (hito.icono) {
                    <lucide-icon [name]="hito.icono" [size]="22" [strokeWidth]="2.5"></lucide-icon>
                  } @else {
                    <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>
                  }
                </div>
                <span class="mt-1 text-sm font-semibold text-slate-700 text-center leading-tight max-w-36">{{ hito.nombre }}</span>
              </div>
              @if (hito.subetapas.length > 0) {
                <div class="w-full bg-blue-50/50 rounded border border-blue-100 px-1.5 py-1 max-w-44">
                  @for (sub of hito.subetapas; track sub) {
                    <div class="flex items-center gap-1 py-px">
                      <span class="w-1 h-1 rounded-full bg-blue-300 shrink-0"></span>
                      <span class="text-[10px] text-blue-600/80 leading-tight">{{ sub }}</span>
                    </div>
                  }
                </div>
              }
            </div>
            @if (!hlast) {
              <div class="shrink-0 mx-1 flex items-center" style="height: 48px">
                <div class="flex items-center">
                  <div class="w-5 h-[3px] bg-blue-300 rounded-full"></div>
                  <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-blue-300"></div>
                </div>
              </div>
            }
          }
          @if (bloque.financiero.length === 0) {
            <div class="flex items-center justify-center min-h-[3rem] w-full">
              <span class="text-slate-200 text-xs">—</span>
            </div>
          }
        </div>
      }


      @for (bloque of bloques(); track bloque.grupoId; let first = $first; let i = $index) {
        <!-- Separator (operativo row) -->
        @if (!first) {
          @let prevBloque = bloques()[i - 1];
          <div class="relative" style="width: 36px">
            <div class="absolute inset-0 flex justify-center pointer-events-none">
              <div class="w-px h-full" style="background:repeating-linear-gradient(to bottom,#cbd5e1 0,#cbd5e1 8px,transparent 8px,transparent 20px)"></div>
            </div>
            @if (prevBloque.operativo.length > 0 && bloque.operativo.length > 0) {
              <div class="absolute left-0 right-0 flex justify-center" style="top: 12px; height: 48px; align-items: center">
                <div class="flex items-center bg-white px-0.5">
                  <div class="w-5 h-[3px] bg-amber-300 rounded-full"></div>
                  <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-amber-300"></div>
                </div>
              </div>
            }
          </div>
        }
        <!-- Operativo content -->
        <div class="flex items-start justify-center px-3 pt-3 pb-4">
          @for (hito of bloque.operativo; track hito.nombre; let hlast = $last) {
            <div class="flex flex-col items-center shrink-0">
              <div class="flex flex-col items-center h-20">
                <div class="w-12 h-12 rounded-full flex items-center justify-center border-2 border-amber-400 bg-amber-50 text-amber-500 shrink-0">
                  @if (hito.icono) {
                    <lucide-icon [name]="hito.icono" [size]="22" [strokeWidth]="2.5"></lucide-icon>
                  } @else {
                    <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>
                  }
                </div>
                <span class="mt-1 text-sm font-semibold text-slate-700 text-center leading-tight max-w-36">{{ hito.nombre }}</span>
              </div>
              @if (hito.subetapas.length > 0) {
                <div class="w-full bg-amber-50/50 rounded border border-amber-100 px-1.5 py-1 max-w-44">
                  @for (sub of hito.subetapas; track sub) {
                    <div class="flex items-center gap-1 py-px">
                      <span class="w-1 h-1 rounded-full bg-amber-300 shrink-0"></span>
                      <span class="text-[10px] text-amber-600/80 leading-tight">{{ sub }}</span>
                    </div>
                  }
                </div>
              }
            </div>
            @if (!hlast) {
              <div class="shrink-0 mx-1 flex items-center" style="height: 48px">
                <div class="flex items-center">
                  <div class="w-5 h-[3px] bg-amber-300 rounded-full"></div>
                  <div class="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[9px] border-transparent border-l-amber-300"></div>
                </div>
              </div>
            }
          }
          @if (bloque.operativo.length === 0) {
            <div class="flex items-center justify-center min-h-[3rem] w-full">
              <span class="text-slate-200 text-xs">—</span>
            </div>
          }
        </div>
      }
    </div>

    <!-- Legend -->
    <div class="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-5 text-xs text-slate-500">
      <span class="flex items-center gap-1.5">
        <span class="w-5 h-3" style="background:repeating-linear-gradient(to bottom,#94a3b8 0,#94a3b8 4px,transparent 4px,transparent 10px);width:1px;display:inline-block"></span>
        Grupo paralelo (ejecución simultánea)
      </span>
    </div>
  </div>
  `,
})
export class ProcessPreviewComponent {
  hitos = input.required<HitoConfigView[]>();

  gridCols = computed(() => {
    const n = this.bloques().length;
    if (n === 0) return 'auto';
    // (separator + group)* for each bloque
    const cols: string[] = [];
    for (let i = 0; i < n; i++) {
      if (i > 0) cols.push('auto'); // separator
      cols.push('auto'); // group
    }
    return cols.join(' ');
  });

  bloques = computed(() => {
    const active = this.hitos().filter(h => h.activo).sort((a, b) => a.orden - b.orden);

    const grupoMap = new Map<number, HitoConfigView[]>();
    for (const h of active) {
      const gid = h.grupoParalelo?.id ?? 0;
      if (!grupoMap.has(gid)) grupoMap.set(gid, []);
      grupoMap.get(gid)!.push(h);
    }

    const toNode = (h: HitoConfigView): HitoNode => ({
      nombre: h.nombre,
      icono: h.icono || null,
      subetapas: h.subetapas
        .filter(s => s.activo)
        .sort((a, b) => a.orden - b.orden)
        .map(s => s.nombre),
    });

    return [...grupoMap.entries()]
      .map(([gid, hitos]) => ({
        grupoId: gid,
        minOrden: Math.min(...hitos.map(h => h.orden)),
        financiero: hitos.filter(h => h.carril === 'financiero').map(toNode),
        operativo: hitos.filter(h => h.carril === 'operativo').map(toNode),
      }))
      .filter(b => b.financiero.length > 0 || b.operativo.length > 0)
      .sort((a, b) => a.minOrden - b.minOrden);
  });
}
