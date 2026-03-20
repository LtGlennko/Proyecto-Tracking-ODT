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
  <div class="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
    <h3 class="text-sm font-semibold text-slate-700 mb-5">Vista previa del proceso</h3>

    <!-- Grid: 2 rows (financiero + operativo), N columns (label + groups with separators) -->
    <div class="grid min-w-max" [style.grid-template-columns]="gridCols()" style="grid-template-rows: auto auto;">

      <!-- ═══ Row 1: Financiero label ═══ -->
      <div class="flex items-center pr-3 border-b border-slate-200 pb-3">
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-200">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span class="text-[10px] font-semibold text-blue-700 uppercase tracking-wide whitespace-nowrap">Financiero</span>
        </div>
      </div>

      @for (bloque of bloques(); track bloque.grupoId; let first = $first) {
        <!-- Separator (financiero row) -->
        @if (!first) {
          <div class="flex items-stretch justify-center px-3 border-b border-slate-200">
            <div class="border-l-2 border-dashed border-slate-300"></div>
          </div>
        }
        <!-- Financiero content -->
        <div class="flex items-start justify-center gap-1 px-3 pt-3 pb-4 border-b border-slate-200">
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
                <span class="mt-1 text-sm font-semibold text-slate-700 text-center leading-tight max-w-28">{{ hito.nombre }}</span>
              </div>
              @if (hito.subetapas.length > 0) {
                <div class="w-full bg-blue-50/50 rounded border border-blue-100 px-1.5 py-1 max-w-28">
                  @for (sub of hito.subetapas; track sub) {
                    <div class="flex items-center gap-1 py-px">
                      <span class="w-1 h-1 rounded-full bg-blue-300 shrink-0"></span>
                      <span class="text-[10px] text-blue-600/80 leading-tight truncate" [title]="sub">{{ sub }}</span>
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
            <div class="flex items-center justify-center min-h-[3rem] w-full">
              <span class="text-slate-200 text-xs">—</span>
            </div>
          }
        </div>
      }

      <!-- ═══ Row 2: Operativo label ═══ -->
      <div class="flex items-center pr-3 pt-3">
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span class="text-[10px] font-semibold text-amber-700 uppercase tracking-wide whitespace-nowrap">Operativo</span>
        </div>
      </div>

      @for (bloque of bloques(); track bloque.grupoId; let first = $first) {
        <!-- Separator (operativo row) -->
        @if (!first) {
          <div class="flex items-stretch justify-center px-3">
            <div class="border-l-2 border-dashed border-slate-300"></div>
          </div>
        }
        <!-- Operativo content -->
        <div class="flex items-start justify-center gap-1 px-3 pt-3 pb-4">
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
                <span class="mt-1 text-sm font-semibold text-slate-700 text-center leading-tight max-w-28">{{ hito.nombre }}</span>
              </div>
              @if (hito.subetapas.length > 0) {
                <div class="w-full bg-amber-50/50 rounded border border-amber-100 px-1.5 py-1 max-w-28">
                  @for (sub of hito.subetapas; track sub) {
                    <div class="flex items-center gap-1 py-px">
                      <span class="w-1 h-1 rounded-full bg-amber-300 shrink-0"></span>
                      <span class="text-[10px] text-amber-600/80 leading-tight truncate" [title]="sub">{{ sub }}</span>
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
        <span class="w-3 h-3 rounded-full border-2 border-blue-400 bg-blue-50"></span> Carril financiero
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-50"></span> Carril operativo
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-5 border-l-2 border-dashed border-slate-400 h-3"></span>
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
    if (n === 0) return '6rem';
    // label col + (separator + group)* for each bloque
    const cols = ['6rem'];
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
