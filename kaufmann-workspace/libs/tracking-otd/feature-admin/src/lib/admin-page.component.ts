import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HITO_LABELS, HITOS_IDS, SlaConfigModel } from '@kaufmann/shared/models';
import { MOCK_SLA_CONFIGS } from '@kaufmann/tracking-otd/data-access';
import { API_BASE_URL, AuthService } from '@kaufmann/shared/auth';

type AdminTab = 'hitos' | 'sla' | 'usuarios';

interface UsuarioApi {
  id: number;
  azureAdOid: string;
  nombre: string;
  email: string;
  perfil: string;
  activo: boolean;
  empresas: EmpresaApi[];
}

interface EmpresaApi {
  id: number;
  nombre: string;
  codigo: string;
}

@Component({
    selector: 'kf-admin-page',
    imports: [FormsModule],
    template: `
    <div class="p-6 space-y-5">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Administración</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gestión de hitos, SLAs y usuarios</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-200 gap-1">
        @for (tab of tabs; track tab) {
          <button (click)="activeTab.set(tab.id)"
            class="px-5 py-2.5 text-sm font-medium transition-colors rounded-t-md"
          [class]="activeTab() === tab.id
            ? 'bg-white border border-b-white border-slate-200 text-slate-800 -mb-px'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'"
          >{{ tab.label }}</button>
        }
      </div>

      <!-- Tab: Hitos y Subetapas -->
      @if (activeTab() === 'hitos') {
        <div>
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
                @for (hId of HITO_IDS; track hId; let i = $index) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium text-slate-800 text-sm">{{ HITO_LABELS[hId] }}</td>
                    <td class="px-3 py-3 text-center text-slate-500 text-sm">{{ i + 1 }}</td>
                    <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ hId }}</td>
                    <td class="px-3 py-3 text-center">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab: SLA Config -->
      @if (activeTab() === 'sla') {
        <div class="space-y-4">
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
                @for (sla of slaConfigs(); track sla) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
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
                }
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
      }

      <!-- Tab: Usuarios -->
      @if (activeTab() === 'usuarios') {
        <div class="space-y-4">
          @if (loadingUsers()) {
            <div class="flex justify-center py-8">
              <span class="text-slate-400 text-sm">Cargando usuarios...</span>
            </div>
          } @else {
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                    <th class="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Perfil</th>
                    <th class="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Empresas</th>
                    <th class="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                    @if (auth.isSuperAdmin()) {
                      <th class="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style="background-color: #2E75B6;">{{ getInitials(user.nombre) }}</div>
                          <span class="font-medium text-slate-800 text-sm">{{ user.nombre || '—' }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-slate-500 text-sm">{{ user.email || '—' }}</td>
                      <td class="px-3 py-3">
                        @if (editingUserId() === user.id) {
                          <select [ngModel]="editPerfil()" (ngModelChange)="editPerfil.set($event)"
                            class="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @for (p of perfiles; track p) {
                              <option [value]="p.value">{{ p.label }}</option>
                            }
                          </select>
                        } @else {
                          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                            [class]="getPerfilClass(user.perfil)">
                            {{ user.perfil }}
                          </span>
                        }
                      </td>
                      <td class="px-3 py-3">
                        @if (editingUserId() === user.id) {
                          <div class="flex flex-wrap gap-1">
                            @for (emp of allEmpresas(); track emp.id) {
                              <label class="inline-flex items-center gap-1 text-xs cursor-pointer">
                                <input type="checkbox"
                                  [checked]="editEmpresaIds().includes(emp.id)"
                                  (change)="toggleEmpresa(emp.id)"
                                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                {{ emp.nombre }}
                              </label>
                            }
                          </div>
                        } @else {
                          <div class="flex flex-wrap gap-1">
                            @for (emp of user.empresas; track emp.id) {
                              <span class="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{{ emp.nombre }}</span>
                            } @empty {
                              <span class="text-xs text-slate-400">Sin asignar</span>
                            }
                          </div>
                        }
                      </td>
                      <td class="px-3 py-3 text-center">
                        @if (editingUserId() === user.id) {
                          <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" [ngModel]="editActivo()" (ngModelChange)="editActivo.set($event)"
                              class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          </label>
                        } @else {
                          <span class="inline-block w-2 h-2 rounded-full"
                            [class]="user.activo ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                        }
                      </td>
                      @if (auth.isSuperAdmin()) {
                        <td class="px-3 py-3 text-center">
                          @if (editingUserId() === user.id) {
                            <div class="flex items-center justify-center gap-1">
                              <button (click)="saveUser(user)"
                                class="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                [disabled]="saving()">
                                {{ saving() ? '...' : 'Guardar' }}
                              </button>
                              <button (click)="cancelEdit()"
                                class="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">
                                Cancelar
                              </button>
                            </div>
                          } @else {
                            <button (click)="startEdit(user)"
                              class="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              Editar
                            </button>
                          }
                        </td>
                      }
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="px-4 py-8 text-center text-slate-400 text-sm">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
    `
})
export class AdminPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

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

  // Usuarios state
  users = signal<UsuarioApi[]>([]);
  allEmpresas = signal<EmpresaApi[]>([]);
  loadingUsers = signal(false);
  saving = signal(false);

  // Edit state
  editingUserId = signal<number | null>(null);
  editPerfil = signal('');
  editEmpresaIds = signal<number[]>([]);
  editActivo = signal(true);

  perfiles = [
    { value: 'superadministrador', label: 'Superadministrador' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'asesor_comercial', label: 'Asesor Comercial' },
  ];

  constructor() {
    // Load users when switching to usuarios tab
    effect(() => {
      if (this.activeTab() === 'usuarios' && this.users().length === 0) {
        this.loadUsers();
      }
    });
  }

  ngOnInit() {
    this.loadEmpresas();
  }

  async loadUsers(): Promise<void> {
    this.loadingUsers.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<UsuarioApi[]>(`${this.apiUrl}/v1/usuario`)
      );
      this.users.set(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      this.loadingUsers.set(false);
    }
  }

  async loadEmpresas(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<EmpresaApi[]>(`${this.apiUrl}/v1/empresa`)
      );
      this.allEmpresas.set(data);
    } catch (err) {
      console.error('Error loading empresas:', err);
    }
  }

  startEdit(user: UsuarioApi): void {
    this.editingUserId.set(user.id);
    this.editPerfil.set(user.perfil);
    this.editEmpresaIds.set(user.empresas.map(e => e.id));
    this.editActivo.set(user.activo);
  }

  cancelEdit(): void {
    this.editingUserId.set(null);
  }

  toggleEmpresa(empresaId: number): void {
    const current = this.editEmpresaIds();
    if (current.includes(empresaId)) {
      this.editEmpresaIds.set(current.filter(id => id !== empresaId));
    } else {
      this.editEmpresaIds.set([...current, empresaId]);
    }
  }

  async saveUser(user: UsuarioApi): Promise<void> {
    this.saving.set(true);
    try {
      // Update perfil + activo
      await firstValueFrom(
        this.http.patch<UsuarioApi>(`${this.apiUrl}/v1/usuario/${user.id}`, {
          perfil: this.editPerfil(),
          activo: this.editActivo(),
        })
      );

      // Update empresas
      await firstValueFrom(
        this.http.put<UsuarioApi>(`${this.apiUrl}/v1/usuario/${user.id}/empresas`, {
          empresaIds: this.editEmpresaIds(),
        })
      );

      this.editingUserId.set(null);
      await this.loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
    } finally {
      this.saving.set(false);
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  getPerfilClass(perfil: string): string {
    switch (perfil) {
      case 'superadministrador': return 'bg-red-100 text-red-700';
      case 'administrador': return 'bg-purple-100 text-purple-700';
      case 'supervisor': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}
