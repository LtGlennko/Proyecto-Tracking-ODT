import { Component, computed, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

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

interface GrupoParaleloApi {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Bloque {
  grupoId: number;
  grupoNombre: string;
  minOrden: number;
  financiero: HitoConfigView[];
  operativo: HitoConfigView[];
}

@Component({
  selector: 'kf-hito-config-swimlane',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  template: `
  <div class="flex flex-col">

    <!-- Cabecera de carriles (sticky) -->
    <div class="grid grid-cols-2 sticky top-0 z-20 bg-white border-b border-slate-200">
      <div class="flex items-center gap-2 px-5 py-2.5 border-b-2 border-blue-500">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        <span class="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Carril financiero
        </span>
      </div>
      <div class="flex items-center gap-2 px-5 py-2.5 border-b-2 border-amber-500 border-l border-slate-200">
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span class="text-xs font-semibold uppercase tracking-wide text-amber-600">
          Carril operativo
        </span>
      </div>
    </div>

    <!-- Bloques con grupo paralelo -->
    @for (bloque of bloques().bloques; track bloque.grupoId) {
      <div class="border-b border-slate-200">

        <!-- Cabecera del bloque -->
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
          @if (isSuperAdmin() && bloque.grupoId !== 0) {
            <div class="flex gap-0.5">
              <button (click)="moveGroupUp.emit(bloque.grupoId)"
                [disabled]="isFirstBloque(bloques().bloques, bloque.grupoId)"
                class="w-6 h-6 flex items-center justify-center rounded text-slate-400
                       disabled:opacity-30 disabled:cursor-default
                       hover:bg-blue-100 hover:text-blue-600 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
                </svg>
              </button>
              <button (click)="moveGroupDown.emit(bloque.grupoId)"
                [disabled]="isLastBloque(bloques().bloques, bloque.grupoId)"
                class="w-6 h-6 flex items-center justify-center rounded text-slate-400
                       disabled:opacity-30 disabled:cursor-default
                       hover:bg-blue-100 hover:text-blue-600 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          }
          <span class="text-xs font-semibold" [class]="bloque.grupoId === 0 ? 'text-slate-400 italic' : 'text-slate-600'">
            {{ bloque.grupoNombre }}
          </span>
          <span class="ml-auto text-xs text-slate-400 mr-2">
            {{ bloque.financiero.length + bloque.operativo.length }} hitos
          </span>
        </div>

        <!-- Columnas del bloque -->
        <div class="grid grid-cols-2 divide-x divide-slate-200 min-h-24">
          <!-- Columna financiero -->
          <div class="flex flex-col gap-2 p-3">
            @for (hito of bloque.financiero; track hito.hitoId) {
              <ng-container *ngTemplateOutlet="hitoCard; context: {
                $implicit: hito,
                carrilList: bloque.financiero,
                otroCarril: 'operativo',
                otroCarrilLabel: 'Operativo'
              }"/>
            } @empty {
              <div class="flex items-center justify-center h-16">
                <span class="text-xs text-slate-300 italic">— sin hitos —</span>
              </div>
            }
          </div>
          <!-- Columna operativo -->
          <div class="flex flex-col gap-2 p-3">
            @for (hito of bloque.operativo; track hito.hitoId) {
              <ng-container *ngTemplateOutlet="hitoCard; context: {
                $implicit: hito,
                carrilList: bloque.operativo,
                otroCarril: 'financiero',
                otroCarrilLabel: 'Financiero'
              }"/>
            } @empty {
              <div class="flex items-center justify-center h-16">
                <span class="text-xs text-slate-300 italic">— sin actividad —</span>
              </div>
            }
          </div>
        </div>
      </div>
    }


  </div>

  <!-- ═══ Template reutilizable para cada hito card ═══ -->
  <ng-template #hitoCard let-hito let-carrilList="carrilList"
               let-otroCarril="otroCarril" let-otroCarrilLabel="otroCarrilLabel">

    <div class="rounded-lg border transition-colors"
         [class]="hito.activo
           ? 'bg-white border-slate-200 shadow-sm'
           : 'bg-slate-50 border-slate-200 opacity-60'">

      <!-- Header del hito -->
      <div class="flex items-center gap-1.5 px-3 py-2">

        <!-- Botón mover a otro carril (icon only, al borde del otro carril) -->
        @if (isSuperAdmin()) {
          @if (hito.carril === 'operativo') {
            <button (click)="changeCarril.emit({ hito, newCarril: otroCarril })"
              class="w-6 h-6 flex items-center justify-center rounded shrink-0
                     text-slate-300 hover:bg-blue-100 hover:text-blue-600 transition-colors"
              title="Mover a carril financiero">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5 5-5M18 12H6"/>
              </svg>
            </button>
          }
        }

        <!-- Flechas de orden dentro del carril -->
        @if (isSuperAdmin()) {
          <div class="flex flex-col gap-0.5 shrink-0">
            <button (click)="moveHitoUp.emit(hito)"
              [disabled]="isFirstInCarril(hito, carrilList)"
              class="w-5 h-4 flex items-center justify-center rounded text-slate-300
                     disabled:opacity-30 disabled:cursor-default
                     hover:bg-blue-100 hover:text-blue-600 transition-colors">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
              </svg>
            </button>
            <button (click)="moveHitoDown.emit(hito)"
              [disabled]="isLastInCarril(hito, carrilList)"
              class="w-5 h-4 flex items-center justify-center rounded text-slate-300
                     disabled:opacity-30 disabled:cursor-default
                     hover:bg-blue-100 hover:text-blue-600 transition-colors">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        }

        <!-- Nombre del hito -->
        <span class="text-sm font-semibold text-slate-800 flex-1 leading-tight">
          {{ hito.nombre }}
        </span>

        <!-- Toggle activo -->
        @if (isSuperAdmin()) {
          <button (click)="toggleHito.emit(hito)"
            class="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors"
            [class]="hito.activo
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
            <span class="w-1.5 h-1.5 rounded-full" [class]="hito.activo ? 'bg-emerald-500' : 'bg-slate-400'"></span>
            {{ hito.activo ? 'On' : 'Off' }}
          </button>
        } @else {
          <span class="w-2 h-2 rounded-full shrink-0"
            [class]="hito.activo ? 'bg-emerald-500' : 'bg-slate-300'"></span>
        }

        <!-- Botón mover a otro carril (icon only, al borde del otro carril) -->
        @if (isSuperAdmin()) {
          @if (hito.carril === 'financiero') {
            <button (click)="changeCarril.emit({ hito, newCarril: otroCarril })"
              class="w-6 h-6 flex items-center justify-center rounded shrink-0
                     text-slate-300 hover:bg-blue-100 hover:text-blue-600 transition-colors"
              title="Mover a carril operativo">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
              </svg>
            </button>
          }
        }
      </div>

      <!-- Subheader: grupo selector (superadmin) -->
      @if (isSuperAdmin()) {
        <div class="flex items-center gap-2 px-3 pb-2 border-b border-slate-100">

          <!-- Selector de grupo paralelo (positional labels from visual order) -->
          <select class="text-xs border border-slate-200 rounded px-1.5 py-1 flex-1
                         focus:outline-none focus:ring-1 focus:ring-blue-400
                         bg-white text-slate-600"
            [ngModel]="hito.grupoParalelo?.id ?? 0"
            (ngModelChange)="changeGrupo.emit({ hito, grupoId: $event })">
            @for (blq of bloques().bloques; track blq.grupoId) {
              <option [ngValue]="blq.grupoId">{{ blq.grupoNombre }}</option>
            }
          </select>
        </div>
      }

      <!-- Subetapas count + chevron expandir -->
      <div class="flex items-center gap-1.5 px-3 pb-2 cursor-pointer hover:bg-slate-50 transition-colors"
           (click)="toggleExpanded(hito.hitoId)">
        <span class="text-xs text-slate-400">
          {{ countActiveSubs(hito) }}/{{ hito.subetapas.length }} subetapas activas
        </span>
        <svg class="w-3.5 h-3.5 text-slate-400 transition-transform shrink-0"
             [class.rotate-180]="expandedHitoId() === hito.hitoId"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      <!-- Subetapas (expandible) -->
      @if (expandedHitoId() === hito.hitoId) {
        <ul class="divide-y divide-slate-100 rounded-b-lg overflow-hidden">
          @for (sub of hito.subetapas; track sub.subetapaId; let si = $index) {
            <li class="flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                [class]="sub.activo ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 opacity-60'">

              <!-- Flechas subetapa -->
              @if (isSuperAdmin()) {
                <div class="flex flex-col gap-0.5 shrink-0">
                  <button (click)="moveSubUp.emit({ hito, sub })"
                    [disabled]="si === 0"
                    class="w-4 h-3.5 flex items-center justify-center rounded text-slate-300
                           disabled:opacity-30 disabled:cursor-default
                           hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
                    </svg>
                  </button>
                  <button (click)="moveSubDown.emit({ hito, sub })"
                    [disabled]="si === hito.subetapas.length - 1"
                    class="w-4 h-3.5 flex items-center justify-center rounded text-slate-300
                           disabled:opacity-30 disabled:cursor-default
                           hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>
              }

              <!-- Nombre subetapa -->
              <span class="flex-1 font-medium text-slate-700">{{ sub.nombre }}</span>

              <!-- Badge categoría -->
              <span class="px-1.5 py-0.5 rounded text-xs font-medium shrink-0"
                [class]="categoriaClass(sub.categoria)">
                {{ sub.categoria }}
              </span>

              <!-- Badge campo staging -->
              @if (sub.campoStagingVin) {
                <code class="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono shrink-0 hidden xl:inline">
                  {{ sub.campoStagingVin }}
                </code>
              } @else {
                <span class="text-xs text-amber-500 font-medium shrink-0 hidden xl:inline">GAP</span>
              }

              <!-- Toggle activo subetapa -->
              @if (isSuperAdmin()) {
                <button (click)="toggleSub.emit({ hito, sub })"
                  class="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                  [class]="sub.activo
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                  <span class="w-1.5 h-1.5 rounded-full" [class]="sub.activo ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ sub.activo ? 'On' : 'Off' }}
                </button>
              } @else {
                <span class="w-2 h-2 rounded-full shrink-0"
                  [class]="sub.activo ? 'bg-emerald-500' : 'bg-slate-300'"></span>
              }
            </li>
          } @empty {
            <li class="px-3 py-3 text-xs text-slate-400 italic text-center">Sin subetapas</li>
          }
        </ul>
      }
    </div>
  </ng-template>
  `
})
export class HitoConfigSwimlaneComponent {
  // ── Inputs ──
  hitos        = input.required<HitoConfigView[]>();
  grupos       = input.required<GrupoParaleloApi[]>();
  isSuperAdmin = input<boolean>(false);

  // ── Outputs ──
  moveHitoUp   = output<HitoConfigView>();
  moveHitoDown = output<HitoConfigView>();
  moveGroupUp  = output<number>();
  moveGroupDown = output<number>();
  changeCarril = output<{ hito: HitoConfigView; newCarril: string }>();
  toggleHito   = output<HitoConfigView>();
  moveSubUp    = output<{ hito: HitoConfigView; sub: SubetapaConfigView }>();
  moveSubDown  = output<{ hito: HitoConfigView; sub: SubetapaConfigView }>();
  toggleSub    = output<{ hito: HitoConfigView; sub: SubetapaConfigView }>();
  changeGrupo  = output<{ hito: HitoConfigView; grupoId: number }>();
  deleteGroup  = output<number>();

  // ── Local state ──
  expandedHitoId = signal<number | null>(null);

  // ── Computed: agrupa hitos en bloques por grupoParalelo ──
  // Always appends a virtual empty trailing group (grupoId=0) for assigning hitos.
  bloques = computed(() => {
    const all = this.hitos().slice().sort((a, b) => a.orden - b.orden);

    const grupoMap = new Map<number, HitoConfigView[]>();

    for (const h of all) {
      if (h.grupoParalelo) {
        const gid = h.grupoParalelo.id;
        if (!grupoMap.has(gid)) grupoMap.set(gid, []);
        grupoMap.get(gid)!.push(h);
      }
    }

    const bloquesFromHitos: Bloque[] = [...grupoMap.entries()]
      .map(([gid, hitos]) => ({
        grupoId: gid,
        grupoNombre: '',
        minOrden: Math.min(...hitos.map(h => h.orden)),
        financiero: hitos.filter(h => h.carril === 'financiero').sort((a, b) => a.orden - b.orden),
        operativo: hitos.filter(h => h.carril === 'operativo').sort((a, b) => a.orden - b.orden),
      }))
      .sort((a, b) => a.minOrden - b.minOrden);

    // Virtual empty trailing group (id=0 as sentinel)
    const bloques: Bloque[] = [
      ...bloquesFromHitos,
      { grupoId: 0, grupoNombre: '', minOrden: Infinity, financiero: [], operativo: [] },
    ];

    // Assign positional labels: Grupo 1, Grupo 2, etc.
    bloques.forEach((b, i) => b.grupoNombre = `Grupo ${i + 1}`);

    return { bloques };
  });

  // ── Helpers ──

  toggleExpanded(hitoId: number): void {
    this.expandedHitoId.update(v => v === hitoId ? null : hitoId);
  }

  isFirstInCarril(hito: HitoConfigView, carrilList: HitoConfigView[]): boolean {
    return carrilList[0]?.hitoId === hito.hitoId;
  }

  isLastInCarril(hito: HitoConfigView, carrilList: HitoConfigView[]): boolean {
    return carrilList[carrilList.length - 1]?.hitoId === hito.hitoId;
  }

  isFirstBloque(bloques: Bloque[], grupoId: number): boolean {
    return bloques[0]?.grupoId === grupoId;
  }

  isLastBloque(bloques: Bloque[], grupoId: number): boolean {
    const real = bloques.filter(b => b.grupoId !== 0);
    return real[real.length - 1]?.grupoId === grupoId;
  }

  countActiveSubs(hito: HitoConfigView): number {
    return hito.subetapas.filter(s => s.activo).length;
  }

  categoriaClass(cat: string): string {
    const map: Record<string, string> = {
      COMEX: 'bg-blue-100 text-blue-700',
      LOGISTICA: 'bg-emerald-100 text-emerald-700',
      COMERCIAL: 'bg-purple-100 text-purple-700',
      TALLER: 'bg-orange-100 text-orange-700',
    };
    return map[cat] ?? 'bg-slate-100 text-slate-600';
  }
}
