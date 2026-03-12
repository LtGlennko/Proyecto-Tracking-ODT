import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SlaConfigModel } from '@kaufmann/shared/models';
import { MOCK_SLA_CONFIGS } from '@kaufmann/tracking-otd/data-access';
import { API_BASE_URL, AuthService } from '@kaufmann/shared/auth';

type AdminTab = 'hitos' | 'config' | 'sla' | 'usuarios';

// GET /v1/hitos → master hitos with subetapas
interface HitoMaster {
  id: number;
  nombre: string;
  carril: string;
  subetapas: SubetapaMaster[];
}

interface SubetapaMaster {
  id: number;
  hitoId: number;
  nombre: string;
  categoria: string;
  campoStagingVin: string | null;
}

// GET /v1/hitos/config/:tipoVehiculo
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

const STAGING_VIN_DATE_COLUMNS: { value: string; label: string }[] = [
  { value: 'fecha_colocacion', label: 'fecha_colocacion' },
  { value: 'fecha_liberacion_fabrica', label: 'fecha_liberacion_fabrica' },
  { value: 'fecha_recojo_carr_zcar', label: 'fecha_recojo_carr_zcar' },
  { value: 'fecha_ingreso_prod_carr_planif', label: 'fecha_ingreso_prod_carr_planif' },
  { value: 'fecha_ingreso_prod_carr_real', label: 'fecha_ingreso_prod_carr_real' },
  { value: 'fecha_lib_prod_carr_planif', label: 'fecha_lib_prod_carr_planif' },
  { value: 'fecha_fin_prod_carr_real', label: 'fecha_fin_prod_carr_real' },
  { value: 'etd', label: 'etd' },
  { value: 'fecha_embarque_sap', label: 'fecha_embarque_sap' },
  { value: 'fecha_llegada_aduana', label: 'fecha_llegada_aduana' },
  { value: 'fecha_llegada_sap', label: 'fecha_llegada_sap' },
  { value: 'eta', label: 'eta' },
  { value: 'fecha_aduana_sap', label: 'fecha_aduana_sap' },
  { value: 'fecha_nacion', label: 'fecha_nacion' },
  { value: 'fecha_ingreso_patio', label: 'fecha_ingreso_patio' },
  { value: 'fecha_liberado_sap', label: 'fecha_liberado_sap' },
  { value: 'fecha_preasignacion', label: 'fecha_preasignacion' },
  { value: 'fecha_asignacion', label: 'fecha_asignacion' },
  { value: 'fecha_facturacion_sap', label: 'fecha_facturacion_sap' },
  { value: 'fecha_factura_comex', label: 'fecha_factura_comex' },
  { value: 'fcc', label: 'fcc' },
  { value: 'fcr', label: 'fcr' },
  { value: 'fcl', label: 'fcl' },
  { value: 'fclr', label: 'fclr' },
  { value: 'fecha_entrega_planificada', label: 'fecha_entrega_planificada' },
  { value: 'fecha_entrega_real', label: 'fecha_entrega_real' },
  { value: 'fecha_entrega_cliente', label: 'fecha_entrega_cliente' },
];

const TIPO_VEHICULO_OPTIONS = [
  { value: 'camion', label: 'Camiones' },
  { value: 'bus', label: 'Buses' },
  { value: 'maquinaria', label: 'Maquinaria' },
  { value: 'vehiculo_ligero', label: 'Vehículo Ligero' },
  { value: 'leasing', label: 'Leasing' },
];

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

      <!-- ═══ Tab 1: Hitos Maestros ═══ -->
      @if (activeTab() === 'hitos') {
        <div class="space-y-3">
          <p class="text-xs text-slate-400">Catálogo maestro de hitos y subetapas. Edita nombre, categoría y el campo de staging_vin asociado.</p>

          @if (loadingMaster()) {
            <div class="flex justify-center py-8">
              <span class="text-slate-400 text-sm">Cargando hitos...</span>
            </div>
          } @else {
            @for (hito of hitosMaster(); track hito.id) {
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <!-- Hito header -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                  (click)="toggleMasterExpanded(hito.id)">
                  <span class="text-slate-400 text-xs w-5 text-center">{{ expandedMasterHitoId() === hito.id ? '▼' : '▶' }}</span>
                  <span class="text-sm font-semibold text-slate-800 flex-1">{{ hito.nombre }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="getCarrilClass(hito.carril)">
                    {{ hito.carril }}
                  </span>
                  <span class="text-xs text-slate-400">{{ hito.subetapas.length }} subetapas</span>
                </div>

                <!-- Subetapas table -->
                @if (expandedMasterHitoId() === hito.id) {
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th class="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-10">#</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Subetapa</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Categoría</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Campo staging_vin</th>
                        @if (auth.isSuperAdmin()) {
                          <th class="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-28">Acciones</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (sub of hito.subetapas; track sub.id; let i = $index) {
                        <tr class="border-b border-slate-100 hover:bg-slate-50">
                          <td class="px-4 py-2.5 text-slate-400 text-xs">{{ i + 1 }}</td>
                          <td class="px-3 py-2.5">
                            @if (editingMasterSubId() === sub.id) {
                              <input type="text" [ngModel]="editSubNombre()" (ngModelChange)="editSubNombre.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            } @else {
                              <span class="text-sm text-slate-800 font-medium">{{ sub.nombre }}</span>
                            }
                          </td>
                          <td class="px-3 py-2.5">
                            @if (editingMasterSubId() === sub.id) {
                              <select [ngModel]="editSubCategoria()" (ngModelChange)="editSubCategoria.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                @for (cat of categorias; track cat) {
                                  <option [value]="cat">{{ cat }}</option>
                                }
                              </select>
                            } @else {
                              <span class="text-xs px-1.5 py-0.5 rounded font-medium"
                                [class]="getCategoriaClass(sub.categoria)">
                                {{ sub.categoria }}
                              </span>
                            }
                          </td>
                          <td class="px-3 py-2.5">
                            @if (editingMasterSubId() === sub.id) {
                              <select [ngModel]="editSubCampo()" (ngModelChange)="editSubCampo.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">— GAP manual —</option>
                                @for (col of stagingVinColumns; track col.value) {
                                  <option [value]="col.value">{{ col.label }}</option>
                                }
                              </select>
                            } @else {
                              @if (sub.campoStagingVin) {
                                <code class="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">{{ sub.campoStagingVin }}</code>
                              } @else {
                                <span class="text-xs text-amber-600 font-medium">GAP manual</span>
                              }
                            }
                          </td>
                          @if (auth.isSuperAdmin()) {
                            <td class="px-3 py-2.5 text-center">
                              @if (editingMasterSubId() === sub.id) {
                                <div class="flex items-center justify-center gap-1">
                                  <button (click)="saveMasterSub(sub)"
                                    class="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                    [disabled]="savingMasterSub()">
                                    {{ savingMasterSub() ? '...' : 'OK' }}
                                  </button>
                                  <button (click)="cancelMasterSubEdit()"
                                    class="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">
                                    X
                                  </button>
                                </div>
                              } @else {
                                <button (click)="startMasterSubEdit(sub)"
                                  class="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                  Editar
                                </button>
                              }
                            </td>
                          }
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="px-4 py-6 text-center text-slate-400 text-sm">Sin subetapas</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            } @empty {
              <div class="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400 text-sm">
                No hay hitos configurados
              </div>
            }
          }
        </div>
      }

      <!-- ═══ Tab 2: Config por Tipo de Vehículo ═══ -->
      @if (activeTab() === 'config') {
        <div class="space-y-4">
          <p class="text-xs text-slate-400">Configura orden, grupo paralelo y activación de hitos y subetapas para cada tipo de vehículo.</p>

          <!-- Vehicle type selector -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-600">Tipo de vehículo:</span>
            <div class="flex gap-1">
              @for (tv of tipoVehiculoOptions; track tv.value) {
                <button (click)="selectTipoVehiculo(tv.value)"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border"
                  [class]="selectedTipoVehiculo() === tv.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
                  {{ tv.label }}
                </button>
              }
            </div>
          </div>

          @if (loadingConfig()) {
            <div class="flex justify-center py-8">
              <span class="text-slate-400 text-sm">Cargando configuración...</span>
            </div>
          } @else {
            @for (hc of hitoConfigs(); track hc.hitoId; let hi = $index) {
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <!-- Hito header row -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                  (click)="toggleConfigExpanded(hc.hitoId)">
                  <!-- Arrow buttons for hito reorder -->
                  @if (auth.isSuperAdmin()) {
                    <div class="flex flex-col gap-0.5" (click)="$event.stopPropagation()">
                      <button (click)="moveHito(hi, -1)"
                        class="w-5 h-4 flex items-center justify-center rounded text-slate-400 transition-colors"
                        [class]="hi === 0 ? 'opacity-30 cursor-default' : 'hover:bg-blue-100 hover:text-blue-600'"
                        [disabled]="hi === 0">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                      </button>
                      <button (click)="moveHito(hi, 1)"
                        class="w-5 h-4 flex items-center justify-center rounded text-slate-400 transition-colors"
                        [class]="hi === hitoConfigs().length - 1 ? 'opacity-30 cursor-default' : 'hover:bg-blue-100 hover:text-blue-600'"
                        [disabled]="hi === hitoConfigs().length - 1">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                    </div>
                  } @else {
                    <span class="text-slate-400 text-xs w-5 text-center">{{ expandedConfigHitoId() === hc.hitoId ? '▼' : '▶' }}</span>
                  }
                  <span class="text-sm font-semibold text-slate-800 flex-1">{{ hc.nombre }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="getCarrilClass(hc.carril)">
                    {{ hc.carril }}
                  </span>
                  @if (hc.grupoParalelo) {
                    <span class="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {{ hc.grupoParalelo.nombre }}
                    </span>
                  }
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    [class]="hc.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'">
                    <span class="w-1.5 h-1.5 rounded-full" [class]="hc.activo ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                    {{ hc.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                  @if (auth.isSuperAdmin()) {
                    <button (click)="$event.stopPropagation(); toggleHitoActivo(hc)"
                      class="text-xs px-2 py-1 rounded transition-colors"
                      [class]="hc.activo ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'">
                      {{ hc.activo ? 'Desactivar' : 'Activar' }}
                    </button>
                  }
                </div>

                @if (expandedConfigHitoId() === hc.hitoId) {
                  <!-- Hito config controls (superadmin) -->
                  @if (auth.isSuperAdmin()) {
                    <div class="flex items-center gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs">
                      <label class="flex items-center gap-1.5">
                        <span class="text-slate-500 font-medium">Grupo paralelo:</span>
                        <select [ngModel]="hc.grupoParalelo?.id ?? 0" (ngModelChange)="patchHitoConfig(hc, { grupoParaleloId: $event === 0 ? null : $event })"
                          class="px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option [ngValue]="0">— Ninguno —</option>
                          @for (gp of gruposParalelos(); track gp.id) {
                            <option [ngValue]="gp.id">{{ gp.nombre }}</option>
                          }
                        </select>
                      </label>
                    </div>
                  }

                  <!-- Subetapas config table -->
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200">
                      <tr>
                        @if (auth.isSuperAdmin()) {
                          <th class="text-center px-2 py-2 text-xs font-semibold text-slate-500 uppercase w-14">Orden</th>
                        }
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Subetapa</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Categoría</th>
                        <th class="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-20">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (sub of hc.subetapas; track sub.subetapaId; let si = $index) {
                        <tr class="border-b border-slate-100 hover:bg-slate-50">
                          @if (auth.isSuperAdmin()) {
                            <td class="px-2 py-2 text-center">
                              <div class="flex items-center justify-center gap-0.5">
                                <button (click)="moveSub(hc, si, -1)"
                                  class="w-5 h-5 flex items-center justify-center rounded text-slate-400 transition-colors"
                                  [class]="si === 0 ? 'opacity-30 cursor-default' : 'hover:bg-blue-100 hover:text-blue-600'"
                                  [disabled]="si === 0">
                                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                                </button>
                                <button (click)="moveSub(hc, si, 1)"
                                  class="w-5 h-5 flex items-center justify-center rounded text-slate-400 transition-colors"
                                  [class]="si === hc.subetapas.length - 1 ? 'opacity-30 cursor-default' : 'hover:bg-blue-100 hover:text-blue-600'"
                                  [disabled]="si === hc.subetapas.length - 1">
                                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                </button>
                              </div>
                            </td>
                          }
                          <td class="px-3 py-2.5">
                            <span class="text-sm text-slate-800 font-medium">{{ sub.nombre }}</span>
                          </td>
                          <td class="px-3 py-2.5">
                            <span class="text-xs px-1.5 py-0.5 rounded font-medium"
                              [class]="getCategoriaClass(sub.categoria)">
                              {{ sub.categoria }}
                            </span>
                          </td>
                          <td class="px-3 py-2.5 text-center">
                            @if (auth.isSuperAdmin()) {
                              <button (click)="toggleSubActivo(sub)"
                                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors"
                                [class]="sub.activo ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                                <span class="w-1.5 h-1.5 rounded-full" [class]="sub.activo ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                                {{ sub.activo ? 'On' : 'Off' }}
                              </button>
                            } @else {
                              <span class="inline-block w-2 h-2 rounded-full"
                                [class]="sub.activo ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="px-4 py-6 text-center text-slate-400 text-sm">Sin subetapas</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            } @empty {
              <div class="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400 text-sm">
                No hay hitos configurados para este tipo de vehículo
              </div>
            }
          }
        </div>
      }

      <!-- ═══ Tab 3: SLA Config ═══ -->
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

      <!-- ═══ Tab 4: Usuarios ═══ -->
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

  activeTab = signal<AdminTab>('hitos');
  tabs = [
    { id: 'hitos' as AdminTab, label: 'Hitos Maestros' },
    { id: 'config' as AdminTab, label: 'Config por Tipo' },
    { id: 'sla' as AdminTab, label: 'SLA Config' },
    { id: 'usuarios' as AdminTab, label: 'Usuarios' },
  ];

  // ── Tab 1: Hitos Maestros ──
  hitosMaster = signal<HitoMaster[]>([]);
  loadingMaster = signal(false);
  expandedMasterHitoId = signal<number | null>(null);
  stagingVinColumns = STAGING_VIN_DATE_COLUMNS;
  categorias = ['COMEX', 'LOGISTICA', 'COMERCIAL', 'TALLER'];

  editingMasterSubId = signal<number | null>(null);
  editSubNombre = signal('');
  editSubCategoria = signal('');
  editSubCampo = signal('');
  savingMasterSub = signal(false);

  // ── Tab 2: Config por Tipo ──
  tipoVehiculoOptions = TIPO_VEHICULO_OPTIONS;
  selectedTipoVehiculo = signal('camion');
  hitoConfigs = signal<HitoConfigView[]>([]);
  gruposParalelos = signal<GrupoParaleloApi[]>([]);
  loadingConfig = signal(false);
  expandedConfigHitoId = signal<number | null>(null);

  // ── Tab 3: SLA ──
  slaConfigs = signal<SlaConfigModel[]>([...MOCK_SLA_CONFIGS]);
  newSlaObjetivo = 30;
  newSlaTolerance = 5;

  // ── Tab 4: Usuarios ──
  users = signal<UsuarioApi[]>([]);
  allEmpresas = signal<EmpresaApi[]>([]);
  loadingUsers = signal(false);
  saving = signal(false);

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
    // Load master hitos when tab opens
    effect(() => {
      if (this.activeTab() === 'hitos' && this.hitosMaster().length === 0) {
        this.loadMasterHitos();
      }
    });
    // Load config when switching to config tab or changing vehicle type
    effect(() => {
      if (this.activeTab() === 'config') {
        const tipo = this.selectedTipoVehiculo();
        this.loadHitoConfig(tipo);
      }
    });
    // Load users when tab opens
    effect(() => {
      if (this.activeTab() === 'usuarios' && this.users().length === 0) {
        this.loadUsers();
      }
    });
  }

  ngOnInit() {
    this.loadEmpresas();
    this.loadGruposParalelos();
  }

  // ══════════════════════════════════════════
  // Tab 1: Hitos Maestros
  // ══════════════════════════════════════════

  async loadMasterHitos(): Promise<void> {
    this.loadingMaster.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<HitoMaster[]>(`${this.apiUrl}/v1/hitos`)
      );
      this.hitosMaster.set(data);
    } catch (err) {
      console.error('Error loading master hitos:', err);
    } finally {
      this.loadingMaster.set(false);
    }
  }

  toggleMasterExpanded(hitoId: number): void {
    this.editingMasterSubId.set(null);
    this.expandedMasterHitoId.set(this.expandedMasterHitoId() === hitoId ? null : hitoId);
  }

  startMasterSubEdit(sub: SubetapaMaster): void {
    this.editingMasterSubId.set(sub.id);
    this.editSubNombre.set(sub.nombre);
    this.editSubCategoria.set(sub.categoria);
    this.editSubCampo.set(sub.campoStagingVin ?? '');
  }

  cancelMasterSubEdit(): void {
    this.editingMasterSubId.set(null);
  }

  async saveMasterSub(sub: SubetapaMaster): Promise<void> {
    this.savingMasterSub.set(true);
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/v1/hitos/subetapas/${sub.id}`, {
          nombre: this.editSubNombre(),
          categoria: this.editSubCategoria(),
          campoStagingVin: this.editSubCampo() || null,
        })
      );
      this.editingMasterSubId.set(null);
      await this.loadMasterHitos();
    } catch (err) {
      console.error('Error saving subetapa:', err);
    } finally {
      this.savingMasterSub.set(false);
    }
  }

  // ══════════════════════════════════════════
  // Tab 2: Config por Tipo de Vehículo
  // ══════════════════════════════════════════

  selectTipoVehiculo(tipo: string): void {
    this.expandedConfigHitoId.set(null);
    this.selectedTipoVehiculo.set(tipo);
  }

  async loadHitoConfig(tipoVehiculo: string): Promise<void> {
    this.loadingConfig.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<HitoConfigView[]>(`${this.apiUrl}/v1/hitos/config/${tipoVehiculo}`)
      );
      this.hitoConfigs.set(data);
    } catch (err) {
      console.error('Error loading hito config:', err);
    } finally {
      this.loadingConfig.set(false);
    }
  }

  async loadGruposParalelos(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<GrupoParaleloApi[]>(`${this.apiUrl}/v1/hitos/grupos-paralelos`)
      );
      this.gruposParalelos.set(data);
    } catch (err) {
      console.error('Error loading grupos paralelos:', err);
    }
  }

  toggleConfigExpanded(hitoId: number): void {
    this.expandedConfigHitoId.set(this.expandedConfigHitoId() === hitoId ? null : hitoId);
  }

  async toggleHitoActivo(hc: HitoConfigView): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${hc.hitoId}`, { activo: !hc.activo })
      );
      await this.loadHitoConfig(tipo);
    } catch (err) {
      console.error('Error toggling hito:', err);
    }
  }

  patchHitoConfig(hc: HitoConfigView, patch: { grupoParaleloId?: number | null }): void {
    const tipo = this.selectedTipoVehiculo();
    // Optimistic update for grupoParalelo
    if (patch.grupoParaleloId !== undefined) {
      this.hitoConfigs.update(configs => configs.map(c =>
        c.hitoId === hc.hitoId
          ? { ...c, grupoParalelo: patch.grupoParaleloId ? this.gruposParalelos().find(g => g.id === patch.grupoParaleloId) ?? null : null }
          : c
      ));
    }
    firstValueFrom(
      this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${hc.hitoId}`, patch)
    ).then(() => this.loadHitoConfig(tipo))
     .catch(err => console.error('Error patching hito config:', err));
  }

  /** Move hito up (-1) or down (+1) by swapping orden with its neighbor */
  async moveHito(index: number, direction: -1 | 1): Promise<void> {
    const configs = this.hitoConfigs();
    const neighborIdx = index + direction;
    if (neighborIdx < 0 || neighborIdx >= configs.length) return;

    const current = configs[index];
    const neighbor = configs[neighborIdx];
    const tipo = this.selectedTipoVehiculo();

    // Optimistic swap in UI
    const swapped = [...configs];
    swapped[index] = { ...neighbor, orden: current.orden };
    swapped[neighborIdx] = { ...current, orden: neighbor.orden };
    swapped.sort((a, b) => a.orden - b.orden);
    this.hitoConfigs.set(swapped);

    // Persist both
    try {
      await Promise.all([
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${current.hitoId}`, { orden: neighbor.orden })),
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${neighbor.hitoId}`, { orden: current.orden })),
      ]);
      await this.loadHitoConfig(tipo);
    } catch (err) {
      console.error('Error moving hito:', err);
      await this.loadHitoConfig(tipo);
    }
  }

  /** Move subetapa up (-1) or down (+1) within its hito */
  async moveSub(hc: HitoConfigView, index: number, direction: -1 | 1): Promise<void> {
    const subs = hc.subetapas;
    const neighborIdx = index + direction;
    if (neighborIdx < 0 || neighborIdx >= subs.length) return;

    const current = subs[index];
    const neighbor = subs[neighborIdx];
    const tipo = this.selectedTipoVehiculo();

    // Optimistic swap in UI
    this.hitoConfigs.update(configs => configs.map(c => {
      if (c.hitoId !== hc.hitoId) return c;
      const newSubs = [...c.subetapas];
      newSubs[index] = { ...neighbor, orden: current.orden };
      newSubs[neighborIdx] = { ...current, orden: neighbor.orden };
      newSubs.sort((a, b) => a.orden - b.orden);
      return { ...c, subetapas: newSubs };
    }));

    // Persist both
    try {
      await Promise.all([
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/subetapa/${current.subetapaId}`, { orden: neighbor.orden })),
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/subetapa/${neighbor.subetapaId}`, { orden: current.orden })),
      ]);
      await this.loadHitoConfig(tipo);
    } catch (err) {
      console.error('Error moving subetapa:', err);
      await this.loadHitoConfig(tipo);
    }
  }

  async toggleSubActivo(sub: SubetapaConfigView): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/subetapa/${sub.subetapaId}`, {
          activo: !sub.activo,
        })
      );
      await this.loadHitoConfig(tipo);
    } catch (err) {
      console.error('Error toggling subetapa:', err);
    }
  }

  // ══════════════════════════════════════════
  // Shared helpers
  // ══════════════════════════════════════════

  getCarrilClass(carril: string): string {
    switch (carril) {
      case 'financiero': return 'bg-violet-100 text-violet-700';
      case 'comercial': return 'bg-blue-100 text-blue-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  }

  getCategoriaClass(cat: string): string {
    switch (cat) {
      case 'COMEX': return 'bg-blue-100 text-blue-700';
      case 'LOGISTICA': return 'bg-emerald-100 text-emerald-700';
      case 'COMERCIAL': return 'bg-purple-100 text-purple-700';
      case 'TALLER': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  // ══════════════════════════════════════════
  // Tab 4: Usuarios
  // ══════════════════════════════════════════

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
      if (current.length <= 1) return;
      this.editEmpresaIds.set(current.filter(id => id !== empresaId));
    } else {
      this.editEmpresaIds.set([...current, empresaId]);
    }
  }

  async saveUser(user: UsuarioApi): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.http.patch<UsuarioApi>(`${this.apiUrl}/v1/usuario/${user.id}`, {
          perfil: this.editPerfil(),
          activo: this.editActivo(),
        })
      );
      await firstValueFrom(
        this.http.put<UsuarioApi>(`${this.apiUrl}/v1/usuario/${user.id}/empresas`, {
          empresaIds: this.editEmpresaIds(),
        })
      );
      this.editingUserId.set(null);
      await this.loadUsers();

      const currentOid = this.auth.currentUser()?.id;
      if (currentOid && user.azureAdOid === currentOid) {
        await this.auth.refreshProfile();
      }
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
