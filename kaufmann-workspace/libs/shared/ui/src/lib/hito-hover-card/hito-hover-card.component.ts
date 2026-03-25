import { Component, input } from '@angular/core';
import {
  stageStatusLabel, stageStatusLabelClass,
  subStatusLabel, subStatusBadgeClass, subDotClass,
} from '@kaufmann/shared/utils';

export interface HoverSubStage {
  name: string;
  status: string;
  fecha?: string;
  esPlan?: boolean;
}

@Component({
  selector: 'kf-hito-hover-card',
  standalone: true,
  imports: [],
  template: `
    <div class="fixed -translate-x-1/2 z-[100] bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-56 max-w-[90vw] sm:max-w-72 pointer-events-none"
         [style.left.px]="posX()" [style.top.px]="posY()">
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-xs font-bold text-slate-800">{{ stageName() }}</span>
        <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full" [class]="statusLabelClass(stageStatus())">{{ statusLabel(stageStatus()) }}</span>
      </div>
      <div class="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1 items-center">
        @for (sub of subStages(); track sub.name) {
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="dotClass(sub.status)"></span>
            <span class="text-[11px] text-slate-600">{{ sub.name }}</span>
          </div>
          <span class="px-1 py-0.5 text-[9px] font-medium rounded text-center whitespace-nowrap" [class]="badgeClass(sub.status)">{{ badgeLabel(sub.status) }}</span>
          @if (sub.fecha) {
            <span class="text-[10px] font-mono whitespace-nowrap text-right" [class]="sub.esPlan ? 'text-st-active' : 'text-st-ontime'">{{ sub.fecha }}</span>
          } @else {
            <span></span>
          }
        }
      </div>
      @if (lastPlanDate()) {
        <div class="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
          Plan: <span class="font-medium text-st-active">{{ lastPlanDate() }}</span>
        </div>
      }
    </div>
  `,
})
export class HitoHoverCardComponent {
  stageName = input.required<string>();
  stageStatus = input.required<string>();
  subStages = input.required<HoverSubStage[]>();
  lastPlanDate = input<string>('');
  posX = input.required<number>();
  posY = input.required<number>();

  statusLabel = stageStatusLabel;
  statusLabelClass = stageStatusLabelClass;
  badgeLabel = subStatusLabel;
  badgeClass = subStatusBadgeClass;
  dotClass = subDotClass;
}
