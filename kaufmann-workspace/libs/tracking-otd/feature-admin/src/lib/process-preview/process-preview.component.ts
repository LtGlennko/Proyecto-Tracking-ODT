import { Component, computed, input } from '@angular/core';

interface HitoConfigView {
  hitoConfigId: number;
  hitoId: number;
  nombre: string;
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
  categoria: string;
  campoStagingVin: string | null;
  orden: number;
  activo: boolean;
}

interface HitoNode {
  nombre: string;
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
  imports: [],
  template: `
  <div class="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
    <h3 class="text-sm font-semibold text-slate-700 mb-5">Vista previa del proceso</h3>

    <!-- Single flex row: label col + (separator col + group col)* -->
    <div class="relative flex items-stretch min-w-max">

      <!-- ═══ Lane labels column ═══ -->
      <div class="flex flex-col shrink-0 w-24 pr-3">
        <!-- Financiero label (top half) -->
        <div class="flex-1 flex items-center">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-200">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span class="text-[10px] font-semibold text-blue-700 uppercase tracking-wide whitespace-nowrap">Financiero</span>
          </div>
        </div>
        <!-- Operativo label (bottom half) -->
        <div class="flex-1 flex items-center">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span class="text-[10px] font-semibold text-amber-700 uppercase tracking-wide whitespace-nowrap">Operativo</span>
          </div>
        </div>
      </div>

      @for (bloque of bloques(); track bloque.grupoId; let first = $first) {

        <!-- ═══ Dashed vertical separator column (full height, continuous) ═══ -->
        @if (!first) {
          <div class="flex items-stretch justify-center shrink-0 px-5">
            <div class="border-l-2 border-dashed border-slate-300"></div>
          </div>
        }

        <!-- ═══ Group column ═══ -->
        <div class="flex flex-col shrink-0 min-w-28">

          <!-- Financiero section (top half) -->
          <div class="flex-1 flex items-start justify-center gap-1 px-3 pt-3 pb-4">
            @for (hito of bloque.financiero; track hito.nombre; let hlast = $last) {
              <div class="flex flex-col items-center shrink-0">
                <!-- Fixed-height header: circle + name -->
                <div class="flex flex-col items-center h-16">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center border-2
                              border-blue-400 bg-blue-50 text-blue-500 shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="5"/>
                    </svg>
                  </div>
                  <span class="mt-1 text-xs font-semibold text-slate-700 text-center leading-tight max-w-24">
                    {{ hito.nombre }}
                  </span>
                </div>
                <!-- Subetapas below (variable height) -->
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

          <!-- Operativo section (bottom half) -->
          <div class="flex-1 flex items-start justify-center gap-1 px-3 pt-3 pb-4">
            @for (hito of bloque.operativo; track hito.nombre; let hlast = $last) {
              <div class="flex flex-col items-center shrink-0">
                <!-- Fixed-height header: circle + name -->
                <div class="flex flex-col items-center h-16">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center border-2
                              border-amber-400 bg-amber-50 text-amber-500 shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="5"/>
                    </svg>
                  </div>
                  <span class="mt-1 text-xs font-semibold text-slate-700 text-center leading-tight max-w-24">
                    {{ hito.nombre }}
                  </span>
                </div>
                <!-- Subetapas below (variable height) -->
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

      <!-- ═══ Carril separator line (absolute, spans full width at center) ═══ -->
      <div class="absolute left-24 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 pointer-events-none"></div>
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
