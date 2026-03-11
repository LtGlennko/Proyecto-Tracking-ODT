import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HITO_LABELS, HITOS_IDS, SlaConfigModel } from '@kaufmann/shared/models';
import { MOCK_SLA_CONFIGS } from '@kaufmann/tracking-otd/data-access';

type AdminTab = 'hitos' | 'sla' | 'usuarios';

@Component({
  selector: 'kf-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-5">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Administración</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gestión de hitos, SLAs y usuarios</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-200 gap-1">
        <button *ngFor="let tab of tabs" (click)="activeTab.set(tab.id)"
          class="px-5 py-2.5 text-sm font-medium transition-colors rounded-t-md"
          [class]="activeTab() === tab.id
            ? 'bg-white border border-b-white border-slate-200 text-slate-800 -mb-px'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'"
        >{{ tab.label }}</button>
      </div>

      <!-- Tab: Hitos y Subetapas -->
      <div *ngIf="activeTab() === 'hitos'">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hito</th>
                <th class="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Orden</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th class="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let hId of HITO_IDS; let i = index" class="border-b border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800 text-sm">{{ HITO_LABELS[hId] }}</td>
                <td class="px-3 py-3 text-center text-slate-500 text-sm">{{ i + 1 }}</td>
                <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ hId }}</td>
                <td class="px-3 py-3 text-center">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: SLA Config -->
      <div *ngIf="activeTab() === 'sla'" class="space-y-4">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-800">Reglas SLA</h3>
            <button class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + Nueva regla
            </button>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Empresa</th>
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Línea</th>
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Tipo Vehículo</th>
                <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Objetivo</th>
                <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Tolerancia</th>
                <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Crítico</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sla of slaConfigs()" class="border-b border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-2.5 text-slate-500 text-xs">{{ sla.id }}</td>
                <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.empresaId ?? '— Todas' }}</td>
                <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.lineaNegocio ?? '— Todas' }}</td>
                <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.tipoVehiculo ?? '— Todos' }}</td>
                <td class="px-3 py-2.5 text-center">
                  <span class="text-emerald-700 font-semibold text-xs">{{ sla.diasObjetivo }}d</span>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <span class="text-amber-600 font-semibold text-xs">+{{ sla.diasTolerancia }}d</span>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <span class="text-red-600 font-semibold text-xs">{{ sla.diasObjetivo + sla.diasTolerancia }}d</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SLA form preview -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 class="text-sm font-semibold text-slate-800 mb-4">Nueva Regla SLA</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-slate-600 block mb-1">Días Objetivo</label>
              <input type="number" [(ngModel)]="newSlaObjetivo" min="1"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 block mb-1">Días Tolerancia</label>
              <input type="number" [(ngModel)]="newSlaTolerance" min="0"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="mt-3 p-3 bg-slate-50 rounded-lg text-sm">
            <span class="text-slate-500">Días crítico calculado: </span>
            <span class="font-bold text-red-600">{{ newSlaObjetivo + newSlaTolerance }}d</span>
          </div>
        </div>
      </div>

      <!-- Tab: Usuarios -->
      <div *ngIf="activeTab() === 'usuarios'">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th class="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Perfil</th>
                <th class="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of mockUsers" class="border-b border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-semibold"
                         style="background-color: #2E75B6;">{{ user.initials }}</div>
                    <span class="font-medium text-slate-800 text-sm">{{ user.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-500 text-sm">{{ user.email }}</td>
                <td class="px-3 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class]="user.role === 'administrador' ? 'bg-purple-100 text-purple-700' :
                             user.role === 'supervisor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center">
                  <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminPageComponent {
  readonly HITO_LABELS = HITO_LABELS;
  readonly HITO_IDS = [...HITOS_IDS];

  activeTab = signal<AdminTab>('hitos');
  tabs = [
    { id: 'hitos' as AdminTab, label: 'Hitos y Subetapas' },
    { id: 'sla' as AdminTab, label: 'SLA Config' },
    { id: 'usuarios' as AdminTab, label: 'Usuarios' },
  ];

  slaConfigs = signal<SlaConfigModel[]>([...MOCK_SLA_CONFIGS]);

  newSlaObjetivo = 30;
  newSlaTolerance = 5;

  mockUsers = [
    { name: 'Juan Pérez', email: 'j.perez@kaufmann.com', role: 'administrador', initials: 'JP' },
    { name: 'Maria Lopez', email: 'm.lopez@kaufmann.com', role: 'supervisor', initials: 'ML' },
    { name: 'Roberto Gomez', email: 'r.gomez@kaufmann.com', role: 'asesor_comercial', initials: 'RG' },
    { name: 'Ana Torres', email: 'a.torres@kaufmann.com', role: 'asesor_comercial', initials: 'AT' },
    { name: 'Carlos Ruiz', email: 'c.ruiz@kaufmann.com', role: 'asesor_comercial', initials: 'CR' },
  ];
}
