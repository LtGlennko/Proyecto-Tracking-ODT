import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UploadRecord {
  id: string;
  filename: string;
  source: 'SAP' | 'COMEX';
  date: string;
  user: string;
  records: number;
  status: 'success' | 'error' | 'processing';
}

@Component({
  selector: 'kf-staging-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Staging — Carga de Datos</h1>
        <p class="text-sm text-slate-500 mt-0.5">Upload de archivos Excel PROPED (COMEX) y Reporte Fichas (SAP)</p>
      </div>

      <!-- Upload zones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- PROPED COMEX -->
        <div class="bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors p-8 text-center cursor-pointer group"
             (dragover)="$event.preventDefault()"
             (drop)="onDrop($event, 'COMEX')">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">📦</span>
          </div>
          <h3 class="font-semibold text-slate-800 mb-1">PROPED — COMEX</h3>
          <p class="text-xs text-slate-500 mb-4">Arrastre el archivo Excel o haga click para seleccionar</p>
          <p class="text-xs text-slate-400">Acepta: .xlsx, .xls</p>
          <input type="file" accept=".xlsx,.xls" class="hidden"
                 (change)="onFileSelect($event, 'COMEX')" #fileInputComex />
          <button (click)="fileInputComex.click()"
            class="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Seleccionar PROPED
          </button>
        </div>

        <!-- SAP Fichas -->
        <div class="bg-white rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors p-8 text-center cursor-pointer group"
             (dragover)="$event.preventDefault()"
             (drop)="onDrop($event, 'SAP')">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">📊</span>
          </div>
          <h3 class="font-semibold text-slate-800 mb-1">Reporte Fichas — SAP</h3>
          <p class="text-xs text-slate-500 mb-4">Arrastre el archivo Excel o haga click para seleccionar</p>
          <p class="text-xs text-slate-400">Acepta: .xlsx, .xls</p>
          <input type="file" accept=".xlsx,.xls" class="hidden"
                 (change)="onFileSelect($event, 'SAP')" #fileInputSap />
          <button (click)="fileInputSap.click()"
            class="mt-4 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Seleccionar Reporte SAP
          </button>
        </div>
      </div>

      <!-- Preview table (shown when file loaded) -->
      <div *ngIf="previewVisible()" class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-800">Vista Previa — {{ previewSource() }}</h3>
          <div class="flex gap-3 text-xs">
            <span class="text-slate-500">{{ previewRows().length }} filas</span>
            <span class="text-emerald-600 font-medium">3 VINs nuevos</span>
            <span class="text-amber-600 font-medium">1 VIN a actualizar</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th *ngFor="let col of previewCols()" class="px-3 py-2 text-left font-semibold text-slate-500 uppercase">
                  {{ col }}
                  <span class="ml-1 text-emerald-500">✓</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of previewRows()" class="border-b border-slate-50 hover:bg-slate-50">
                <td *ngFor="let col of previewCols()" class="px-3 py-2 text-slate-600">{{ row[col] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-slate-200 flex justify-end gap-3">
          <button (click)="previewVisible.set(false)"
            class="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ✓ Confirmar y Procesar
          </button>
        </div>
      </div>

      <!-- Upload history -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-3 border-b border-slate-200">
          <h3 class="text-sm font-semibold text-slate-800">Historial de Cargas</h3>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Archivo</th>
              <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Fuente</th>
              <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
              <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Usuario</th>
              <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Registros</th>
              <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let rec of history()" class="border-b border-slate-100 hover:bg-slate-50">
              <td class="px-4 py-2.5 font-mono text-xs text-slate-600">{{ rec.filename }}</td>
              <td class="px-3 py-2.5">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  [class]="rec.source === 'SAP' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'">
                  {{ rec.source }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-xs text-slate-500">{{ rec.date }}</td>
              <td class="px-3 py-2.5 text-xs text-slate-600">{{ rec.user }}</td>
              <td class="px-3 py-2.5 text-center text-xs text-slate-600">{{ rec.records }}</td>
              <td class="px-3 py-2.5 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  [class]="rec.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                           rec.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'">
                  {{ rec.status === 'success' ? '✓ Exitoso' : rec.status === 'error' ? '✗ Error' : '⟳ Procesando' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StagingPageComponent {
  previewVisible = signal(false);
  previewSource = signal<'SAP' | 'COMEX'>('COMEX');
  previewCols = signal<string[]>(['VIN', 'Modelo', 'Lote', 'OC', 'Estado', 'Fecha Llegada']);
  previewRows = signal<Record<string, string>[]>([
    { VIN: 'WDB123ABC456789', Modelo: 'Actros 2651', Lote: 'LOTE-MAR-26', OC: 'OC-001', Estado: 'En almacén', 'Fecha Llegada': '2026-03-15' },
    { VIN: 'WDB987XYZ123456', Modelo: 'Atego 1726', Lote: 'LOTE-MAR-26', OC: 'OC-002', Estado: 'En aduana', 'Fecha Llegada': '2026-03-18' },
    { VIN: 'WDB456DEF789012', Modelo: 'O 500 RSD', Lote: 'LOTE-ABR-BUS', OC: 'OC-003', Estado: 'Embarque', 'Fecha Llegada': '2026-03-22' },
  ]);

  history = signal<UploadRecord[]>([
    { id: '1', filename: 'PROPED_FEB_2026.xlsx', source: 'COMEX', date: '2026-02-28', user: 'Juan Pérez', records: 15, status: 'success' },
    { id: '2', filename: 'Fichas_SAP_FEB2026.xlsx', source: 'SAP', date: '2026-02-25', user: 'Maria Lopez', records: 22, status: 'success' },
    { id: '3', filename: 'PROPED_ENE_2026.xlsx', source: 'COMEX', date: '2026-01-31', user: 'Juan Pérez', records: 18, status: 'success' },
    { id: '4', filename: 'Fichas_SAP_ENE2026_v2.xlsx', source: 'SAP', date: '2026-01-15', user: 'Ana Torres', records: 0, status: 'error' },
  ]);

  onFileSelect(event: Event, source: 'SAP' | 'COMEX') {
    this.previewSource.set(source);
    this.previewVisible.set(true);
  }

  onDrop(event: DragEvent, source: 'SAP' | 'COMEX') {
    event.preventDefault();
    this.previewSource.set(source);
    this.previewVisible.set(true);
  }
}
