import { Component, input, output, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VinModel, HitoTracking, HITO_LABELS } from '@kaufmann/shared/models';
import { StatusBadgeComponent, VehicleIconComponent } from '@kaufmann/shared/ui';
import { formatDate, calculateDiff } from '@kaufmann/shared/utils';
import { VisualMapComponent } from '../visual-map/visual-map.component';
import { GanttViewComponent } from '../gantt-view/gantt-view.component';

type DrawerTab = 'subetapas' | 'visual' | 'gantt';

@Component({
  selector: 'kf-tracking-drawer',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, VehicleIconComponent, VisualMapComponent, GanttViewComponent],
  templateUrl: './tracking-drawer.component.html',
})
export class TrackingDrawerComponent {
  vin = input.required<VinModel>();
  selectedStageId = input<string | null>(null);
  isOpen = input<boolean>(false);
  closed = output<void>();

  activeTab = signal<DrawerTab>('subetapas');
  expandedHitoId = signal<string | null>(null);

  readonly HITO_LABELS = HITO_LABELS;
  readonly formatDate = formatDate;
  readonly calculateDiff = calculateDiff;

  tabs: { id: DrawerTab; label: string }[] = [
    { id: 'subetapas', label: 'Subetapas' },
    { id: 'visual', label: 'Vista General' },
    //{ id: 'gantt', label: 'Gantt' },
  ];

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closed.emit();
  }

  setTab(tab: DrawerTab) {
    this.activeTab.set(tab);
  }

  toggleHito(hitoId: string) {
    this.expandedHitoId.update(v => v === hitoId ? null : hitoId);
  }

  hitoStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'delayed':   return 'bg-red-100 text-red-700 border border-red-200';
      case 'active':    return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:          return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  }

  hitoProgressWidth(hito: HitoTracking): number {
    if (hito.status === 'completed') return 100;
    if (hito.status === 'pending') return 0;
    const completed = hito.subStages.filter(s => s.status === 'completed').length;
    return hito.subStages.length > 0 ? Math.round((completed / hito.subStages.length) * 100) : 30;
  }

  hitoProgressColor(hito: HitoTracking): string {
    if (hito.status === 'delayed') return 'bg-red-500';
    if (hito.status === 'completed') return 'bg-emerald-500';
    if (hito.status === 'active') return 'bg-blue-500';
    return 'bg-slate-200';
  }

  subStageStatusDot(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'active':    return 'bg-blue-500 animate-pulse';
      default:          return 'bg-slate-300';
    }
  }

  onVisualMapNodeClick(hitoId: string) {
    this.activeTab.set('subetapas');
    this.expandedHitoId.set(hitoId);
  }
}
