import { Component, input, output, signal, computed, effect, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { VinModel, HitoTracking } from '@kaufmann/shared/models';
import { StatusBadgeComponent, VehicleIconComponent } from '@kaufmann/shared/ui';
import {
  formatDate, calculateDiff, subStatusLabel as subStatusLabelFn,
  subStatusBadgeClass as subStatusBadgeClassFn, subDotClass,
  hitoStatusPillClass, progressBarColor, tramoPairClass,
} from '@kaufmann/shared/utils';

@Component({
    selector: 'kf-tracking-drawer',
    imports: [StatusBadgeComponent, VehicleIconComponent],
    templateUrl: './tracking-drawer.component.html'
})
export class TrackingDrawerComponent {
  vin = input.required<VinModel>();
  selectedStageId = input<number | null>(null);
  isOpen = input<boolean>(false);
  closed = output<void>();

  expandedHitoId = signal<number | null>(null);
  drawerMainTab = signal<'detalle' | 'datos' | 'tramos'>('detalle');
  animated = signal(false);

  hitoPairs = computed(() => {
    const stages = this.vin().stages;
    if (stages.length < 2) return [];
    const pairs: { from: string; to: string; days: number | null; status: string }[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const current = stages[i];
      const next = stages[i + 1];
      const currentEnd = current.real?.end || current.plan?.end;
      const nextStart = next.real?.start || next.plan?.start;
      let days: number | null = null;
      let status = 'pending';
      if (currentEnd && nextStart) {
        const endMs = new Date(currentEnd + 'T00:00:00').getTime();
        const startMs = new Date(nextStart + 'T00:00:00').getTime();
        days = Math.abs(Math.round((startMs - endMs) / 86400000));
        if (days <= 1) status = 'on-time';
        else if (days <= 5) status = 'at-risk';
        else status = 'delayed';
      }
      pairs.push({ from: current.name, to: next.name, days, status });
    }
    return pairs;
  });

  /** The selected hito (from the visual map click) */
  selectedHito = computed(() => {
    const stageId = this.selectedStageId();
    if (!stageId) return null;
    return this.vin().stages.find((s: HitoTracking) => s.id === stageId) ?? null;
  });

  readonly formatDate = formatDate;
  readonly calculateDiff = calculateDiff;

  formatDateTop(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getUTCDate()).padStart(2, '0');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${day} ${months[d.getUTCMonth()]}`;
  }

  formatDateYear(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return String(d.getUTCFullYear()).slice(2);
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open) {
        requestAnimationFrame(() => this.animated.set(true));
      } else {
        this.animated.set(false);
      }
    });

    effect(() => {
      const stageId = this.selectedStageId();
      if (stageId) this.expandedHitoId.set(stageId);
      this.drawerMainTab.set('detalle');
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) this.closed.emit();
  }

  toggleHito(hitoId: number) {
    this.expandedHitoId.update(v => v === hitoId ? null : hitoId);
  }

  hitoStatusClass(status: string): string {
    return hitoStatusPillClass(status);
  }

  hitoProgressWidth(hito: HitoTracking): number {
    if (hito.status === 'completed') return 100;
    if (hito.status === 'pending') return 0;
    const completed = hito.subStages.filter(s => s.status.startsWith('completed')).length;
    return hito.subStages.length > 0 ? Math.round((completed / hito.subStages.length) * 100) : 30;
  }

  hitoProgressColor(hito: HitoTracking): string {
    return progressBarColor(hito.status);
  }

  subStageStatusDot(status: string): string {
    return subDotClass(status);
  }

  subStatusLabel = subStatusLabelFn;

  subStatusBadgeClass(status: string): string {
    return subStatusBadgeClassFn(status);
  }

  pairStatusLabel(status: string): string {
    switch (status) {
      case 'on-time': return 'A tiempo';
      case 'at-risk': return 'En tolerancia';
      case 'delayed': return 'Demorado';
      default: return 'Pendiente';
    }
  }

  pairStatusClass(status: string): string {
    return tramoPairClass(status);
  }

  onVisualMapNodeClick(hitoId: number) {
    this.expandedHitoId.set(hitoId);
  }

  downloadPdf(): void {
    const vin = this.vin();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header
    const hito = this.selectedHito();
    const title = hito
      ? `Reporte de Tracking - ${vin.id} - ${hito.name}`
      : `Reporte de Tracking - ${vin.id}`;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, y);
    y += 10;

    // ── Datos Generales ──
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos Generales', 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95] },
      body: [
        ['VIN', vin.id],
        ['Modelo', vin.modelo || '—'],
        ['Lote', vin.lote || '—'],
        ['Orden de Compra', vin.ordenCompra || '—'],
        ['Ficha', vin.fichaId || '—'],
        ['Forma de Pago', vin.formaPago || '—'],
        ['Ejecutivo', vin.ejecutivo || '—'],
        ['Estado', vin.estadoGeneral || '—'],
      ],
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Línea de Tiempo (hitos + subetapas) ──
    if (hito) {
      // Single hito detail
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Detalle de Etapa - ${hito.name}`, 14, y);
      y += 2;
      const subRows = hito.subStages.map(s => [
        s.name,
        s.real?.end || s.real?.start || '—',
        s.plan?.end || s.plan?.start || '—',
        this.subStatusLabel(s.status),
      ]);
      autoTable(doc, {
        startY: y,
        head: [['Subetapa', 'Fecha Real', 'Fecha Plan', 'Estado']],
        body: subRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 95] },
        styles: { fontSize: 9 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      // Hito report: no tramos, filename includes hito name
      doc.save(`tracking-${vin.id}-${hito.name}.pdf`);
      return;
    } else {
      // Full bitácora - all hitos
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Línea de Tiempo', 14, y);
      y += 2;
      const timelineRows: any[] = [];
      for (const stage of vin.stages) {
        timelineRows.push([
          { content: stage.name, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
        ]);
        for (const sub of stage.subStages) {
          timelineRows.push([
            '  ' + sub.name,
            sub.real?.end || sub.real?.start || '—',
            sub.plan?.end || sub.plan?.start || '—',
            this.subStatusLabel(sub.status),
          ]);
        }
      }
      autoTable(doc, {
        startY: y,
        head: [['Subetapa', 'Fecha Real', 'Fecha Plan', 'Estado']],
        body: timelineRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 95] },
        styles: { fontSize: 8 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Tramos (only for bitácora) ──
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tramos entre Hitos', 14, y);
    y += 2;
    const pairs = this.hitoPairs();
    if (pairs.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Tramo', 'Días', 'Estado']],
        body: pairs.map(p => [
          `${p.from}  >  ${p.to}`,
          p.days !== null ? String(p.days) : '—',
          this.pairStatusLabel(p.status),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 95] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`tracking-${vin.id}.pdf`);
  }
}
