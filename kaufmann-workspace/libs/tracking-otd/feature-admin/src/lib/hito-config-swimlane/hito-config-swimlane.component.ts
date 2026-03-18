import { Component, computed, signal, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDragHandle,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

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
  campoStagingReal: string | null;
  campoStagingPlan: string | null;
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
  imports: [NgTemplateOutlet, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDropList],
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      opacity: 0.9;
      background: white;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed #94a3b8;
      border-radius: 8px;
      background: #f1f5f9;
    }
    .cdk-drag-animating {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }
    /* Group drag styles */
    .group-drag-preview {
      box-sizing: border-box;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      opacity: 0.9;
      background: white;
      border-radius: 8px;
    }
    .group-drag-placeholder {
      opacity: 0.2;
      border: 2px dashed #3b82f6;
      border-radius: 8px;
      background: #eff6ff;
      min-height: 80px;
    }
    /* Subetapa drag styles */
    .sub-drag-preview {
      box-sizing: border-box;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
      opacity: 0.9;
      background: white;
      border-radius: 4px;
      font-size: 12px;
      padding: 6px 12px;
    }
    .sub-drag-placeholder {
      opacity: 0.3;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      background: #f8fafc;
    }
    /* Hide empty placeholder when a drag item enters the list */
    .cdk-drop-list-receiving .empty-lane-placeholder,
    .cdk-drop-list-dragging .empty-lane-placeholder {
      display: none;
    }
  `],
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

    <!-- Bloques con grupo paralelo — drop list para reordenar grupos -->
    <div cdkDropList
         [cdkDropListData]="bloques().bloques"
         (cdkDropListDropped)="dropGroup($event)"
         [cdkDropListDisabled]="!isSuperAdmin()">

      @for (bloque of bloques().bloques; track bloque.grupoId) {
        <div class="border-b border-slate-200"
             [cdkDragDisabled]="bloque.grupoId === 0 || !isSuperAdmin()"
             cdkDrag>

          <!-- Drag handle for group -->
          <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200"
               [class.cursor-grab]="isSuperAdmin() && bloque.grupoId !== 0"
               cdkDragHandle>
            @if (isSuperAdmin() && bloque.grupoId !== 0) {
              <!-- Drag grip icon -->
              <svg class="w-4 h-4 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                <circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/>
                <circle cx="9" cy="15" r="1.5"/><circle cx="15" cy="15" r="1.5"/>
                <circle cx="9" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/>
              </svg>
            }
            <span class="text-xs font-semibold" [class]="bloque.grupoId === 0 ? 'text-slate-400 italic' : 'text-slate-600'">
              {{ bloque.grupoNombre }}
            </span>
            <!-- Expand/collapse chevron (only if group has hitos) -->
            @if (bloque.financiero.length + bloque.operativo.length > 0) {
              <button (click)="toggleGrupoExpanded(bloque.grupoId); $event.stopPropagation()"
                class="shrink-0 p-0.5 rounded hover:bg-slate-200 transition-colors">
                <svg class="w-3.5 h-3.5 text-slate-400 transition-transform"
                     [class.rotate-180]="!isGrupoCollapsed(bloque.grupoId)"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            }
            <span class="ml-auto text-xs text-slate-400 mr-2">
              {{ bloque.financiero.length + bloque.operativo.length }} hitos
            </span>
          </div>

          <!-- Columnas del bloque — all lists connected globally for cross-group drag -->
          @if (!isGrupoCollapsed(bloque.grupoId)) {
            <div class="grid grid-cols-2 divide-x divide-slate-200 min-h-24">
              <!-- Columna financiero -->
              <div cdkDropList
                   [cdkDropListData]="bloque.financiero"
                   [id]="'financiero-' + bloque.grupoId"
                   [cdkDropListConnectedTo]="allHitoListIds()"
                   (cdkDropListDropped)="dropHito($event, bloque.grupoId, 'financiero')"
                   [cdkDropListDisabled]="!isSuperAdmin()"
                   class="flex flex-col gap-2 p-3 min-h-24">
                @for (hito of bloque.financiero; track hito.hitoId) {
                  <div cdkDrag [cdkDragDisabled]="!isSuperAdmin()">
                    <ng-container [ngTemplateOutlet]="hitoCard"
                      [ngTemplateOutletContext]="{
                        $implicit: hito,
                        carrilList: bloque.financiero,
                        otroCarril: 'operativo',
                        otroCarrilLabel: 'Operativo'
                      }"/>
                    <!-- Custom drag preview for hito -->
                    <div *cdkDragPreview class="cdk-drag-preview px-3 py-2 border border-slate-200 min-w-48">
                      <span class="text-sm font-semibold text-slate-800">{{ hito.nombre }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-lane-placeholder flex items-center justify-center h-16">
                    <span class="text-xs text-slate-300 italic">— sin hitos —</span>
                  </div>
                }
              </div>
              <!-- Columna operativo -->
              <div cdkDropList
                   [cdkDropListData]="bloque.operativo"
                   [id]="'operativo-' + bloque.grupoId"
                   [cdkDropListConnectedTo]="allHitoListIds()"
                   (cdkDropListDropped)="dropHito($event, bloque.grupoId, 'operativo')"
                   [cdkDropListDisabled]="!isSuperAdmin()"
                   class="flex flex-col gap-2 p-3 min-h-24">
                @for (hito of bloque.operativo; track hito.hitoId) {
                  <div cdkDrag [cdkDragDisabled]="!isSuperAdmin()">
                    <ng-container [ngTemplateOutlet]="hitoCard"
                      [ngTemplateOutletContext]="{
                        $implicit: hito,
                        carrilList: bloque.operativo,
                        otroCarril: 'financiero',
                        otroCarrilLabel: 'Financiero'
                      }"/>
                    <div *cdkDragPreview class="cdk-drag-preview px-3 py-2 border border-slate-200 min-w-48">
                      <span class="text-sm font-semibold text-slate-800">{{ hito.nombre }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-lane-placeholder flex items-center justify-center h-16">
                    <span class="text-xs text-slate-300 italic">— sin hitos —</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

  </div>

  <!-- ═══ Template reutilizable para cada hito card ═══ -->
  <ng-template #hitoCard let-hito let-carrilList="carrilList"
               let-otroCarril="otroCarril" let-otroCarrilLabel="otroCarrilLabel">

    <div class="rounded-lg border transition-colors"
         [class]="hito.activo
           ? 'bg-white border-slate-200 shadow-sm'
           : 'bg-slate-50 border-slate-200 opacity-60'"
>

      <!-- Header del hito -->
      <div class="flex items-center gap-1.5 px-3 py-2">

        <!-- Drag grip icon for hito (cdkDragHandle so only this icon triggers hito drag) -->
        @if (isSuperAdmin()) {
          <svg cdkDragHandle class="w-3.5 h-3.5 text-slate-300 shrink-0 cursor-grab" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
          </svg>
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
      </div>

      <!-- Subetapas count + chevron expandir (only if hito has subetapas) -->
      @if (hito.subetapas.length > 0) {
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
      }

      <!-- Subetapas (expandible + drag) -->
      @if (hito.subetapas.length > 0 && expandedHitoId() === hito.hitoId) {
        <div cdkDropList
             [cdkDropListData]="hito.subetapas"
             (cdkDropListDropped)="dropSub($event, hito)"
             [cdkDropListDisabled]="!isSuperAdmin()"
             class="rounded-b-lg overflow-hidden">
          @for (sub of hito.subetapas; track sub.subetapaId; let si = $index) {
            <div cdkDrag [cdkDragDisabled]="!isSuperAdmin()"
                 class="flex items-center gap-2 px-3 py-2 text-xs transition-colors border-t border-slate-100"
                 [class]="sub.activo ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 opacity-60'">

              <!-- Drag grip for subetapa -->
              @if (isSuperAdmin()) {
                <svg cdkDragHandle class="w-3 h-3 text-slate-300 shrink-0 cursor-grab" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
                  <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                  <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
                </svg>
              }

              <!-- Nombre subetapa -->
              <span class="flex-1 font-medium text-slate-700">{{ sub.nombre }}</span>

              <!-- Badge campo staging -->
              @if (sub.campoStagingReal) {
                <code class="text-xs bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded font-mono shrink-0 hidden xl:inline">
                  {{ sub.campoStagingReal }}
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

              <!-- Custom drag preview for sub -->
              <div *cdkDragPreview class="sub-drag-preview">
                {{ sub.nombre }}
              </div>
            </div>
          } @empty {
            <div class="px-3 py-3 text-xs text-slate-400 italic text-center">Sin subetapas</div>
          }
        </div>
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
  reorderHitos = output<{ grupoId: number; carril: string; hitoIds: number[] }>();
  moveHitoToTarget = output<{ hitoId: number; newCarril: string; newGrupoId: number; orderedHitoIds: number[] }>();
  reorderGroups = output<{ orderedGrupoIds: number[] }>();
  reorderSubs  = output<{ hitoId: number; subetapaIds: number[] }>();
  toggleHito   = output<HitoConfigView>();
  toggleSub    = output<{ hito: HitoConfigView; sub: SubetapaConfigView }>();
  deleteGroup  = output<number>();

  // ── Local state ──
  expandedHitoId = signal<number | null>(null);
  collapsedGrupoIds = signal<Set<number>>(new Set());

  // ── Computed: agrupa hitos en bloques por grupoParalelo ──
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

  // ── All hito drop list IDs for cross-group connections ──
  allHitoListIds = computed(() => {
    const ids: string[] = [];
    for (const b of this.bloques().bloques) {
      ids.push(`financiero-${b.grupoId}`);
      ids.push(`operativo-${b.grupoId}`);
    }
    return ids;
  });

  // ── Drop handlers ──

  /** Hito dropped: reorder within same list, or move across carril/grupo */
  dropHito(event: CdkDragDrop<HitoConfigView[]>, targetGrupoId: number, targetCarril: string): void {
    if (event.previousContainer === event.container) {
      // Same carril + same grupo → just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.reorderHitos.emit({
        grupoId: targetGrupoId,
        carril: targetCarril,
        hitoIds: event.container.data.map(h => h.hitoId),
      });
    } else {
      // Cross-carril and/or cross-grupo transfer
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const movedHito = event.container.data[event.currentIndex];
      this.moveHitoToTarget.emit({
        hitoId: movedHito.hitoId,
        newCarril: targetCarril,
        newGrupoId: targetGrupoId,
        orderedHitoIds: event.container.data.map(h => h.hitoId),
      });
    }
  }

  /** Group dropped: reorder bloques */
  dropGroup(event: CdkDragDrop<Bloque[]>): void {
    const bloques = [...this.bloques().bloques];
    const realBloques = bloques.filter(b => b.grupoId !== 0);

    // Clamp indices to valid real-group range (drop after virtual trailing → last real position)
    const prevIdx = Math.min(event.previousIndex, realBloques.length - 1);
    const currIdx = Math.min(event.currentIndex, realBloques.length - 1);
    if (prevIdx === currIdx) return;

    moveItemInArray(realBloques, prevIdx, currIdx);
    this.reorderGroups.emit({
      orderedGrupoIds: realBloques.map(b => b.grupoId),
    });
  }

  /** Subetapa dropped: reorder within hito */
  dropSub(event: CdkDragDrop<SubetapaConfigView[]>, hito: HitoConfigView): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.reorderSubs.emit({
      hitoId: hito.hitoId,
      subetapaIds: event.container.data.map(s => s.subetapaId),
    });
  }

  // ── Helpers ──

  toggleGrupoExpanded(grupoId: number): void {
    this.collapsedGrupoIds.update(set => {
      const next = new Set(set);
      if (next.has(grupoId)) {
        next.delete(grupoId);
      } else {
        next.add(grupoId);
      }
      return next;
    });
  }

  isGrupoCollapsed(grupoId: number): boolean {
    return this.collapsedGrupoIds().has(grupoId);
  }

  toggleExpanded(hitoId: number): void {
    this.expandedHitoId.update(v => v === hitoId ? null : hitoId);
  }

  countActiveSubs(hito: HitoConfigView): number {
    return hito.subetapas.filter(s => s.activo).length;
  }
}
