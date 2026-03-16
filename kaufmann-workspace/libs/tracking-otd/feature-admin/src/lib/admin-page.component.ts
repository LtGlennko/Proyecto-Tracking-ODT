import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { SlaConfigModel } from '@kaufmann/shared/models';
import { MOCK_SLA_CONFIGS } from '@kaufmann/tracking-otd/data-access';
import { API_BASE_URL, AuthService } from '@kaufmann/shared/auth';
import { HitoConfigSwimlaneComponent } from './hito-config-swimlane/hito-config-swimlane.component';
import { ProcessPreviewComponent } from './process-preview/process-preview.component';

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
  { id: 1, label: 'Camiones' },
  { id: 2, label: 'Buses' },
  { id: 3, label: 'Maquinaria' },
  { id: 4, label: 'Vehículo Ligero' },
];

@Component({
    selector: 'kf-admin-page',
    imports: [FormsModule, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview, HitoConfigSwimlaneComponent, ProcessPreviewComponent],
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
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-400">Catálogo maestro de hitos y subetapas. Arrastra para reordenar, selecciona el carril por defecto y edita subetapas.</p>
            @if (auth.isSuperAdmin()) {
              <button (click)="showNewHitoForm.set(true)"
                class="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 ml-4"
                [class.hidden]="showNewHitoForm()">
                + Nuevo hito
              </button>
            }
          </div>

          <!-- Formulario nuevo hito -->
          @if (showNewHitoForm() && auth.isSuperAdmin()) {
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-end gap-3">
              <div class="flex-1">
                <label class="text-xs font-medium text-slate-600 block mb-1">Nombre del hito</label>
                <input type="text" [ngModel]="newHitoNombre()" (ngModelChange)="newHitoNombre.set($event)"
                  placeholder="Ej: Importación"
                  class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="text-xs font-medium text-slate-600 block mb-1">Carril</label>
                <select [ngModel]="newHitoCarril()" (ngModelChange)="newHitoCarril.set($event)"
                  class="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="financiero">Financiero</option>
                  <option value="operativo">Operativo</option>
                </select>
              </div>
              <button (click)="createMasterHito()"
                class="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                [disabled]="!newHitoNombre().trim() || savingNewHito()">
                {{ savingNewHito() ? '...' : 'Crear' }}
              </button>
              <button (click)="showNewHitoForm.set(false); newHitoNombre.set('')"
                class="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                Cancelar
              </button>
            </div>
          }

          @if (loadingMaster()) {
            <div class="flex justify-center py-8">
              <span class="text-slate-400 text-sm">Cargando hitos...</span>
            </div>
          } @else {
            <div cdkDropList [cdkDropListData]="hitosMaster()" (cdkDropListDropped)="onDropHito($event)" class="space-y-3">
            @for (hito of hitosMaster(); track hito.id) {
              <div cdkDrag [cdkDragData]="hito" class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <!-- Hito header -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                  <!-- Drag handle -->
                  <span cdkDragHandle class="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing" title="Arrastrar para reordenar">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
                  </span>
                  <span class="text-sm font-semibold text-slate-800 flex-1 select-none" (click)="toggleMasterExpanded(hito.id)">{{ hito.nombre }}</span>

                  <!-- Carril selector -->
                  <div class="flex rounded-md border border-slate-200 overflow-hidden">
                    <button (click)="changeMasterCarril(hito, 'financiero'); $event.stopPropagation()"
                      class="px-2 py-1 text-xs font-medium transition-colors"
                      [class]="hito.carril === 'financiero' ? 'bg-violet-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'">
                      Financiero
                    </button>
                    <button (click)="changeMasterCarril(hito, 'operativo'); $event.stopPropagation()"
                      class="px-2 py-1 text-xs font-medium border-l border-slate-200 transition-colors"
                      [class]="hito.carril === 'operativo' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'">
                      Operativo
                    </button>
                  </div>

                  <span class="text-xs text-slate-400 select-none" (click)="toggleMasterExpanded(hito.id)">{{ hito.subetapas.length }} subetapas</span>

                  @if (auth.isSuperAdmin()) {
                    @if (confirmDeleteHitoId() === hito.id) {
                      <div class="flex items-center gap-1" (click)="$event.stopPropagation()">
                        <span class="text-xs text-red-600 font-medium">¿Eliminar?</span>
                        <button (click)="deleteMasterHito(hito.id)"
                          class="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Sí</button>
                        <button (click)="confirmDeleteHitoId.set(null)"
                          class="px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">No</button>
                      </div>
                    } @else {
                      <button (click)="confirmDeleteHitoId.set(hito.id); $event.stopPropagation()"
                        class="text-slate-300 hover:text-red-500 transition-colors" title="Eliminar hito">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    }
                  }

                  <span class="text-slate-400 text-xs w-5 text-center select-none" (click)="toggleMasterExpanded(hito.id)">{{ expandedMasterHitoId() === hito.id ? '▼' : '▶' }}</span>
                </div>

                <!-- Drag preview -->
                <div *cdkDragPreview class="bg-white rounded-lg border-2 border-blue-400 shadow-lg px-4 py-3 text-sm font-semibold text-slate-800 w-64">
                  {{ hito.nombre }}
                </div>

                <!-- Subetapas table -->
                @if (expandedMasterHitoId() === hito.id) {
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th class="text-left px-2 py-2 text-xs font-semibold text-slate-500 uppercase w-8"></th>
                        <th class="text-left px-2 py-2 text-xs font-semibold text-slate-500 uppercase w-10">#</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Subetapa</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Campo staging_vin</th>
                        @if (auth.isSuperAdmin()) {
                          <th class="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase w-28">Acciones</th>
                        }
                      </tr>
                    </thead>
                    <tbody cdkDropList [cdkDropListData]="hito.subetapas" (cdkDropListDropped)="onDropSubetapa(hito.id, $event)">
                      @for (sub of hito.subetapas; track sub.id; let i = $index) {
                        <tr cdkDrag [cdkDragData]="sub" class="border-b border-slate-100 hover:bg-slate-50">
                          <td class="px-2 py-2.5 text-center">
                            <span cdkDragHandle class="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing inline-block">
                              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
                            </span>
                          </td>
                          <td class="px-2 py-2.5 text-slate-400 text-xs">{{ i + 1 }}</td>
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
                              } @else if (confirmDeleteSubId() === sub.id) {
                                <div class="flex items-center justify-center gap-1">
                                  <span class="text-xs text-red-600">¿Eliminar?</span>
                                  <button (click)="deleteMasterSub(sub.id)"
                                    class="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">Sí</button>
                                  <button (click)="confirmDeleteSubId.set(null)"
                                    class="px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300">No</button>
                                </div>
                              } @else {
                                <div class="flex items-center justify-center gap-1">
                                  <button (click)="startMasterSubEdit(sub)"
                                    class="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                    Editar
                                  </button>
                                  <button (click)="confirmDeleteSubId.set(sub.id)"
                                    class="px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                    Eliminar
                                  </button>
                                </div>
                              }
                            </td>
                          }
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="px-4 py-6 text-center text-slate-400 text-sm">Sin subetapas</td>
                        </tr>
                      }
                    </tbody>
                    <!-- Fila para añadir subetapa -->
                    @if (auth.isSuperAdmin()) {
                      <tfoot>
                        @if (addingSubToHitoId() === hito.id) {
                          <tr class="bg-blue-50/50">
                            <td class="px-2 py-2"></td>
                            <td class="px-2 py-2"></td>
                            <td class="px-3 py-2">
                              <input type="text" [ngModel]="newSubNombre()" (ngModelChange)="newSubNombre.set($event)"
                                placeholder="Nombre de la subetapa"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </td>
                            <td class="px-3 py-2">
                              <select [ngModel]="newSubCampo()" (ngModelChange)="newSubCampo.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">— GAP manual —</option>
                                @for (col of stagingVinColumns; track col.value) {
                                  <option [value]="col.value">{{ col.label }}</option>
                                }
                              </select>
                            </td>
                            <td class="px-3 py-2 text-center">
                              <div class="flex items-center justify-center gap-1">
                                <button (click)="createMasterSub(hito.id)"
                                  class="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                  [disabled]="!newSubNombre().trim() || savingNewSub()">
                                  {{ savingNewSub() ? '...' : 'Crear' }}
                                </button>
                                <button (click)="addingSubToHitoId.set(null); newSubNombre.set('')"
                                  class="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">
                                  X
                                </button>
                              </div>
                            </td>
                          </tr>
                        } @else {
                          <tr>
                            <td colspan="5" class="px-4 py-2">
                              <button (click)="addingSubToHitoId.set(hito.id); newSubNombre.set(''); newSubCampo.set('')"
                                class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                + Añadir subetapa
                              </button>
                            </td>
                          </tr>
                        }
                      </tfoot>
                    }
                  </table>
                }
              </div>
            } @empty {
              <div class="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400 text-sm">
                No hay hitos configurados
              </div>
            }
            </div>
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
              @for (tv of tipoVehiculoOptions; track tv.id) {
                <button (click)="selectTipoVehiculo(tv.id)"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border"
                  [class]="selectedTipoVehiculo() === tv.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
                  {{ tv.label }}
                </button>
              }
            </div>
          </div>

          <!-- Toggle: Editor / Vista previa -->
          <div class="flex items-center gap-2">
            <button (click)="showPreview.set(false)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border"
              [class]="!showPreview()
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editor
              </span>
            </button>
            <button (click)="showPreview.set(true)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border"
              [class]="showPreview()
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Vista previa
              </span>
            </button>

            @if (auth.isSuperAdmin()) {
              <div class="ml-auto">
                <button (click)="showResetConfirm.set(true)"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  [disabled]="resetting() || loadingConfig()">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    {{ resetting() ? 'Restableciendo...' : 'Restablecer por defecto' }}
                  </span>
                </button>
              </div>
            }
          </div>

          <!-- Modal confirmación reset -->
          @if (showResetConfirm()) {
            <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" (click)="showResetConfirm.set(false)">
              <div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 space-y-4" (click)="$event.stopPropagation()">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-800">Restablecer flujo por defecto</h3>
                    <p class="text-xs text-slate-500">{{ getTipoVehiculoLabel(selectedTipoVehiculo()) }}</p>
                  </div>
                </div>
                <p class="text-sm text-slate-600">
                  Se eliminarán todas las configuraciones personalizadas de hitos y subetapas para este tipo de vehículo. El flujo volverá al orden y carriles definidos en los hitos maestros.
                </p>
                <p class="text-xs text-amber-600 font-medium">Esta acción no se puede deshacer.</p>
                <div class="flex justify-end gap-2 pt-2">
                  <button (click)="showResetConfirm.set(false)"
                    class="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    Cancelar
                  </button>
                  <button (click)="resetConfigToDefault()"
                    class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                    [disabled]="resetting()">
                    {{ resetting() ? 'Restableciendo...' : 'Restablecer' }}
                  </button>
                </div>
              </div>
            </div>
          }

          @if (loadingConfig()) {
            <div class="flex justify-center py-8">
              <span class="text-slate-400 text-sm">Cargando configuración...</span>
            </div>
          } @else if (hitoConfigs().length === 0) {
            <div class="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400 text-sm">
              No hay hitos configurados para este tipo de vehículo
            </div>
          } @else if (showPreview()) {
            <kf-process-preview [hitos]="hitoConfigs()" />
          } @else {
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <kf-hito-config-swimlane
                [hitos]="hitoConfigs()"
                [grupos]="gruposParalelos()"
                [isSuperAdmin]="auth.isSuperAdmin()"
                (reorderHitos)="handleReorderHitos($event)"
                (moveHitoToTarget)="handleMoveHitoToTarget($event)"
                (reorderGroups)="handleReorderGroups($event)"
                (reorderSubs)="handleReorderSubs($event)"
                (toggleHito)="toggleHitoActivo($event)"
                (toggleSub)="toggleSubActivo($event.sub)"
                (deleteGroup)="deleteGroup($event)"
              />
            </div>
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
                    <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.tipoVehiculoId ?? '— Todos' }}</td>
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
  editingMasterSubId = signal<number | null>(null);
  editSubNombre = signal('');
  editSubCampo = signal('');
  savingMasterSub = signal(false);

  // Create hito
  showNewHitoForm = signal(false);
  newHitoNombre = signal('');
  newHitoCarril = signal('financiero');
  savingNewHito = signal(false);

  // Delete hito
  confirmDeleteHitoId = signal<number | null>(null);

  // Create subetapa
  addingSubToHitoId = signal<number | null>(null);
  newSubNombre = signal('');
  newSubCampo = signal('');
  savingNewSub = signal(false);

  // Delete subetapa
  confirmDeleteSubId = signal<number | null>(null);

  // ── Tab 2: Config por Tipo ──
  tipoVehiculoOptions = TIPO_VEHICULO_OPTIONS;
  selectedTipoVehiculo = signal(1);
  hitoConfigs = signal<HitoConfigView[]>([]);
  gruposParalelos = signal<GrupoParaleloApi[]>([]);
  loadingConfig = signal(false);
  showPreview = signal(false);
  showResetConfirm = signal(false);
  resetting = signal(false);

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

  /** Drag-drop: reorder master hitos */
  async onDropHito(event: CdkDragDrop<HitoMaster[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;
    const items = [...this.hitosMaster()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.hitosMaster.set(items);

    // Persist new order via PATCH /v1/hitos/:id
    const patchCalls = items.map((hito, i) =>
      firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/${hito.id}`, { orden: i + 1 }))
    );
    try {
      await Promise.all(patchCalls);
    } catch (err) {
      console.error('Error reordering master hitos:', err);
      await this.loadMasterHitos();
    }
  }

  /** Drag-drop: reorder subetapas within a master hito */
  async onDropSubetapa(hitoId: number, event: CdkDragDrop<SubetapaMaster[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;
    const hitos = this.hitosMaster();
    const hito = hitos.find(h => h.id === hitoId);
    if (!hito) return;

    const subs = [...hito.subetapas];
    moveItemInArray(subs, event.previousIndex, event.currentIndex);

    // Optimistic update
    this.hitosMaster.set(hitos.map(h => h.id === hitoId ? { ...h, subetapas: subs } : h));

    // Persist new order via PATCH /v1/hitos/subetapas/:id
    const patchCalls = subs.map((sub, i) =>
      firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/subetapas/${sub.id}`, { orden: i + 1 }))
    );
    try {
      await Promise.all(patchCalls);
    } catch (err) {
      console.error('Error reordering master subetapas:', err);
      await this.loadMasterHitos();
    }
  }

  /** Change default carril for a master hito */
  async changeMasterCarril(hito: HitoMaster, carril: string): Promise<void> {
    if (hito.carril === carril) return;

    // Optimistic update
    this.hitosMaster.set(this.hitosMaster().map(h => h.id === hito.id ? { ...h, carril } : h));

    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/${hito.id}`, { carril }));
    } catch (err) {
      console.error('Error updating carril:', err);
      await this.loadMasterHitos();
    }
  }

  /** Create a new master hito */
  async createMasterHito(): Promise<void> {
    const nombre = this.newHitoNombre().trim();
    if (!nombre) return;
    this.savingNewHito.set(true);
    try {
      const maxOrden = this.hitosMaster().length > 0
        ? Math.max(...this.hitosMaster().map(h => h.subetapas.length)) // use array length as proxy
        : 0;
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/v1/hitos`, {
          nombre,
          carril: this.newHitoCarril(),
          orden: this.hitosMaster().length + 1,
        })
      );
      this.showNewHitoForm.set(false);
      this.newHitoNombre.set('');
      await this.loadMasterHitos();
    } catch (err) {
      console.error('Error creating hito:', err);
    } finally {
      this.savingNewHito.set(false);
    }
  }

  /** Delete a master hito and all its subetapas */
  async deleteMasterHito(hitoId: number): Promise<void> {
    this.confirmDeleteHitoId.set(null);
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/v1/hitos/master/${hitoId}`)
      );
      this.hitosMaster.update(list => list.filter(h => h.id !== hitoId));
      if (this.expandedMasterHitoId() === hitoId) this.expandedMasterHitoId.set(null);
    } catch (err) {
      console.error('Error deleting hito:', err);
      await this.loadMasterHitos();
    }
  }

  /** Create a new subetapa under a master hito */
  async createMasterSub(hitoId: number): Promise<void> {
    const nombre = this.newSubNombre().trim();
    if (!nombre) return;
    this.savingNewSub.set(true);
    try {
      const hito = this.hitosMaster().find(h => h.id === hitoId);
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/v1/hitos/${hitoId}/subetapas`, {
          nombre,
          campoStagingVin: this.newSubCampo() || null,
          orden: (hito?.subetapas.length ?? 0) + 1,
        })
      );
      this.addingSubToHitoId.set(null);
      this.newSubNombre.set('');
      this.newSubCampo.set('');
      await this.loadMasterHitos();
    } catch (err) {
      console.error('Error creating subetapa:', err);
    } finally {
      this.savingNewSub.set(false);
    }
  }

  /** Delete a master subetapa */
  async deleteMasterSub(subId: number): Promise<void> {
    this.confirmDeleteSubId.set(null);
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/v1/hitos/subetapas/${subId}`)
      );
      // Optimistic removal
      this.hitosMaster.update(list =>
        list.map(h => ({
          ...h,
          subetapas: h.subetapas.filter(s => s.id !== subId),
        }))
      );
    } catch (err) {
      console.error('Error deleting subetapa:', err);
      await this.loadMasterHitos();
    }
  }

  // ══════════════════════════════════════════
  // Tab 2: Config por Tipo de Vehículo
  // ══════════════════════════════════════════

  selectTipoVehiculo(tipoId: number): void {
    this.selectedTipoVehiculo.set(tipoId);
  }

  async loadHitoConfig(tipoVehiculoId: number, silent = false): Promise<void> {
    if (!silent) this.loadingConfig.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<HitoConfigView[]>(`${this.apiUrl}/v1/hitos/config/${tipoVehiculoId}`)
      );
      this.hitoConfigs.set(data);
    } catch (err) {
      console.error('Error loading hito config:', err);
    } finally {
      if (!silent) this.loadingConfig.set(false);
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

  async toggleHitoActivo(hc: HitoConfigView): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    const newState = !hc.activo;
    // Optimistic update — toggle hito + all its subetapas
    this.hitoConfigs.update(configs =>
      configs.map(h => h.hitoId === hc.hitoId
        ? { ...h, activo: newState, subetapas: h.subetapas.map(s => ({ ...s, activo: newState })) }
        : h
      )
    );
    try {
      const calls: Promise<unknown>[] = [
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${hc.hitoId}`, { activo: newState })),
        ...hc.subetapas
          .filter(s => s.activo !== newState)
          .map(s => firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/subetapa/${s.subetapaId}`, { activo: newState }))),
      ];
      await Promise.all(calls);
    } catch (err) {
      console.error('Error toggling hito:', err);
      await this.loadHitoConfig(tipo, true);
    }
  }

  /** Drag-drop: reorder hitos within same carril+grupo */
  async handleReorderHitos(event: { grupoId: number; carril: string; hitoIds: number[] }): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    const configs = this.hitoConfigs();

    // Get current orden values for peers in this carril+grupo, sorted
    const peers = configs
      .filter(h => h.carril === event.carril && h.grupoParalelo?.id === event.grupoId)
      .sort((a, b) => a.orden - b.orden);

    const ordenes = peers.map(h => h.orden).sort((a, b) => a - b);

    // Assign ordenes to the new order of hitoIds
    const patchCalls = event.hitoIds.map((hitoId, i) =>
      firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${hitoId}`, { orden: ordenes[i] }))
    );

    try {
      await Promise.all(patchCalls);
      await this.loadHitoConfig(tipo, true);
    } catch (err) {
      console.error('Error reordering hitos:', err);
      await this.loadHitoConfig(tipo, true);
    }
  }

  /** Drag-drop: hito moved to different carril and/or grupo.
   *  Handles: same-grupo cross-carril, cross-grupo same-carril, cross-grupo cross-carril.
   *  Also handles virtual trailing grupo (id=0) → create real grupo on demand.
   *  Auto-deletes empty grupos after move. */
  async handleMoveHitoToTarget(event: { hitoId: number; newCarril: string; newGrupoId: number; orderedHitoIds: number[] }): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    const configs = this.hitoConfigs();
    const movedHito = configs.find(h => h.hitoId === event.hitoId);
    const oldGrupoId = movedHito?.grupoParalelo?.id ?? null;

    let actualGrupoId = event.newGrupoId;

    // grupoId=0 means virtual trailing → create a real grupo
    if (actualGrupoId === 0) {
      const newGrupo = await firstValueFrom(
        this.http.post<{ id: number }>(`${this.apiUrl}/v1/hitos/grupos-paralelos`, {})
      );
      actualGrupoId = newGrupo.id;
    }

    // Build the patch for the moved hito: carril + grupo
    const patchCalls: Promise<unknown>[] = [
      firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${event.hitoId}`, {
        carril: event.newCarril,
        grupoParaleloId: actualGrupoId,
      })),
    ];

    // Assign ordenes to the target list's new order
    const targetPeers = configs
      .filter(h => h.carril === event.newCarril && h.grupoParalelo?.id === event.newGrupoId)
      .sort((a, b) => a.orden - b.orden);

    let ordenes: number[];
    if (targetPeers.length > 0) {
      const existing = targetPeers.map(h => h.orden).sort((a, b) => a - b);
      const maxOrden = Math.max(...configs.map(h => h.orden));
      ordenes = [];
      for (let i = 0; i < event.orderedHitoIds.length; i++) {
        ordenes.push(existing[i] ?? maxOrden + i + 1);
      }
    } else {
      const maxOrden = configs.length > 0 ? Math.max(...configs.map(h => h.orden)) : 0;
      ordenes = event.orderedHitoIds.map((_, i) => maxOrden + i + 1);
    }

    event.orderedHitoIds.forEach((hitoId, i) => {
      patchCalls.push(
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${hitoId}`, { orden: ordenes[i] }))
      );
    });

    try {
      await Promise.all(patchCalls);
      await this.loadGruposParalelos();
      await this.loadHitoConfig(tipo, true);

      // Auto-delete old grupo if now empty for this vehicle type
      if (oldGrupoId && oldGrupoId !== actualGrupoId) {
        const stillUsed = this.hitoConfigs().some(c => c.grupoParalelo?.id === oldGrupoId);
        if (!stillUsed) {
          try {
            await firstValueFrom(
              this.http.delete(`${this.apiUrl}/v1/hitos/grupos-paralelos/${oldGrupoId}?tipoVehiculoId=${tipo}`)
            );
            await this.loadGruposParalelos();
            await this.loadHitoConfig(tipo, true);
          } catch (e) {
            console.error('Error cleaning up empty grupo:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error moving hito to target:', err);
      await this.loadHitoConfig(tipo, true);
    }
  }

  /** Drag-drop: reorder grupos by redistributing all orden values */
  async handleReorderGroups(event: { orderedGrupoIds: number[] }): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    const configs = this.hitoConfigs();

    // Collect all orden values sorted ascending
    const allOrdenes = configs.map(h => h.orden).sort((a, b) => a - b);

    // Build new ordered list: hitos grouped by grupo in the new order, preserving internal carril order
    const patchCalls: Promise<unknown>[] = [];
    let ordenIdx = 0;

    for (const grupoId of event.orderedGrupoIds) {
      const hitosInGrupo = configs
        .filter(h => h.grupoParalelo?.id === grupoId)
        .sort((a, b) => a.orden - b.orden);

      for (const hito of hitosInGrupo) {
        const newOrden = allOrdenes[ordenIdx++];
        if (newOrden !== hito.orden) {
          patchCalls.push(
            firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${hito.hitoId}`, { orden: newOrden }))
          );
        }
      }
    }

    try {
      await Promise.all(patchCalls);
      await this.loadHitoConfig(tipo, true);
    } catch (err) {
      console.error('Error reordering groups:', err);
      await this.loadHitoConfig(tipo, true);
    }
  }

  /** Drag-drop: reorder subetapas within a hito */
  async handleReorderSubs(event: { hitoId: number; subetapaIds: number[] }): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    const hito = this.hitoConfigs().find(h => h.hitoId === event.hitoId);
    if (!hito) return;

    // Get existing orden values sorted
    const ordenes = hito.subetapas.map(s => s.orden).sort((a, b) => a - b);

    // Assign ordenes to new order
    const patchCalls = event.subetapaIds.map((subId, i) =>
      firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/subetapa/${subId}`, { orden: ordenes[i] }))
    );

    try {
      await Promise.all(patchCalls);
      await this.loadHitoConfig(tipo, true);
    } catch (err) {
      console.error('Error reordering subetapas:', err);
      await this.loadHitoConfig(tipo, true);
    }
  }

  /** Delete a grupo paralelo — backend reassigns hitos to previous grupo for this vehicle type only */
  async deleteGroup(grupoId: number): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/v1/hitos/grupos-paralelos/${grupoId}?tipoVehiculoId=${tipo}`)
      );
      await this.loadGruposParalelos();
      await this.loadHitoConfig(tipo, true);
    } catch (err) {
      console.error('Error deleting grupo:', err);
    }
  }

  async toggleSubActivo(sub: SubetapaConfigView): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    const newSubState = !sub.activo;

    // Find parent hito to determine cascade
    const parentHito = this.hitoConfigs().find(h => h.subetapas.some(s => s.subetapaId === sub.subetapaId));
    let hitoNeedsToggle = false;
    if (parentHito) {
      const subsAfterToggle = parentHito.subetapas.map(s =>
        s.subetapaId === sub.subetapaId ? newSubState : s.activo
      );
      const anyActive = subsAfterToggle.some(a => a);
      // Activate hito if a sub is activated and hito is off; deactivate if all subs off
      if (newSubState && !parentHito.activo) hitoNeedsToggle = true;
      if (!newSubState && !anyActive && parentHito.activo) hitoNeedsToggle = true;
    }

    // Optimistic update — toggle sub + cascade hito if needed
    this.hitoConfigs.update(configs =>
      configs.map(h => {
        const updatedSubs = h.subetapas.map(s =>
          s.subetapaId === sub.subetapaId ? { ...s, activo: newSubState } : s
        );
        if (h.hitoId === parentHito?.hitoId && hitoNeedsToggle) {
          return { ...h, activo: !h.activo, subetapas: updatedSubs };
        }
        return { ...h, subetapas: updatedSubs };
      })
    );

    try {
      const calls: Promise<unknown>[] = [
        firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/subetapa/${sub.subetapaId}`, { activo: newSubState })),
      ];
      if (parentHito && hitoNeedsToggle) {
        calls.push(firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/config/${tipo}/hito/${parentHito.hitoId}`, { activo: !parentHito.activo })));
      }
      await Promise.all(calls);
    } catch (err) {
      console.error('Error toggling subetapa:', err);
      await this.loadHitoConfig(tipo, true);
    }
  }

  /** Reset config to defaults — deletes all per-tipo config, then reloads (auto-creates defaults) */
  async resetConfigToDefault(): Promise<void> {
    const tipo = this.selectedTipoVehiculo();
    this.resetting.set(true);
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/v1/hitos/config/${tipo}/reset`)
      );
      this.showResetConfirm.set(false);
      await this.loadGruposParalelos();
      await this.loadHitoConfig(tipo);
    } catch (err) {
      console.error('Error resetting config:', err);
    } finally {
      this.resetting.set(false);
    }
  }

  getTipoVehiculoLabel(id: number): string {
    return this.tipoVehiculoOptions.find(t => t.id === id)?.label ?? '';
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
