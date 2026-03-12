import { Component, input, output, computed } from '@angular/core';

import { HitoTracking } from '@kaufmann/shared/models';
import { StageNodeComponent } from '@kaufmann/shared/ui';
import { formatDate } from '@kaufmann/shared/utils';

@Component({
    selector: 'kf-visual-map',
    imports: [StageNodeComponent],
    template: `
    <div class="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
      <h3 class="text-sm font-semibold text-slate-700 mb-6">Mapa Visual de Hitos</h3>
    
      <!-- Main flow -->
      <div class="flex items-center gap-2 flex-nowrap min-w-max mb-8">
        @for (hito of mainFlow(); track hito; let last = $last) {
          <kf-stage-node [hito]="hito" (nodeClick)="nodeClick.emit($event)" />
          @if (!last) {
            <div class="flex items-center flex-shrink-0">
              <div class="w-6 h-0.5 bg-slate-300"></div>
              <div class="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-300"></div>
            </div>
          }
        }
      </div>
    
      <!-- Parallel tracks (PDI, Pago if parallel) -->
      @if (parallelFlow().length > 0) {
        <div class="ml-16 border-l-2 border-dashed border-slate-200 pl-6">
          <p class="text-xs text-slate-400 mb-3">Paralelo</p>
          <div class="flex items-center gap-3 flex-wrap">
            @for (hito of parallelFlow(); track hito; let last = $last) {
              <kf-stage-node [hito]="hito" (nodeClick)="nodeClick.emit($event)" />
              @if (!last) {
                <div class="flex items-center">
                  <div class="w-4 h-0.5 bg-slate-200"></div>
                </div>
              }
            }
          </div>
        </div>
      }
    
      <!-- Legend -->
      <div class="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Completado a tiempo</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full border-2 border-red-500"></span> Demorado</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full border-2 border-blue-500"></span> Activo</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-200"></span> Pendiente</span>
      </div>
    </div>
    `
})
export class VisualMapComponent {
  stages = input.required<HitoTracking[]>();
  nodeClick = output<string>();

  mainFlow = computed(() => this.stages().filter(s => !s.isParallel));
  parallelFlow = computed(() => this.stages().filter(s => s.isParallel));

  readonly formatDate = formatDate;
}
