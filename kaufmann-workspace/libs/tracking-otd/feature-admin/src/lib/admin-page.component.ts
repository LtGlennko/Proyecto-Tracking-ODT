import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { SlaConfigModel } from '@kaufmann/shared/models';
import { API_BASE_URL, AuthService } from '@kaufmann/shared/auth';
import { TipoVehiculoService } from '@kaufmann/tracking-otd/data-access';
import { HitoConfigSwimlaneComponent } from './hito-config-swimlane/hito-config-swimlane.component';
import { ProcessPreviewComponent } from './process-preview/process-preview.component';
import { LucideAngularModule } from 'lucide-angular';
const ICON_OPTIONS: { name: string; label: string }[] = [
  // Transporte
  { name: 'truck', label: 'Camión' },
  { name: 'bus-front', label: 'Bus' },
  { name: 'car', label: 'Auto' },
  { name: 'hard-hat', label: 'Casco' },
  { name: 'container', label: 'Contenedor' },
  { name: 'ship', label: 'Barco' },
  { name: 'plane', label: 'Avión' },
  { name: 'forklift', label: 'Montacargas' },
  { name: 'anchor', label: 'Ancla' },
  { name: 'navigation', label: 'Navegación' },
  { name: 'map-pin', label: 'Ubicación' },
  { name: 'route', label: 'Ruta' },
  { name: 'warehouse', label: 'Almacén' },
  { name: 'factory', label: 'Fábrica' },
  // Finanzas / Documentos
  { name: 'credit-card', label: 'Tarjeta' },
  { name: 'banknote', label: 'Billete' },
  { name: 'wallet', label: 'Billetera' },
  { name: 'receipt', label: 'Recibo' },
  { name: 'file-text', label: 'Documento' },
  { name: 'file-badge', label: 'Certificado' },
  { name: 'file-check', label: 'Doc. verificado' },
  { name: 'folder', label: 'Carpeta' },
  { name: 'clipboard', label: 'Portapapeles' },
  { name: 'clipboard-check', label: 'Check list' },
  { name: 'stamp', label: 'Sello' },
  // Personas
  { name: 'user-check', label: 'Usuario check' },
  { name: 'user', label: 'Usuario' },
  { name: 'users', label: 'Usuarios' },
  { name: 'handshake', label: 'Acuerdo' },
  { name: 'contact', label: 'Contacto' },
  // Tiempo / Calendario
  { name: 'calendar-check', label: 'Calendario' },
  { name: 'calendar', label: 'Calendario simple' },
  { name: 'clock', label: 'Reloj' },
  { name: 'timer', label: 'Cronómetro' },
  { name: 'alarm-clock', label: 'Alarma' },
  // Herramientas / Operaciones
  { name: 'wrench', label: 'Llave' },
  { name: 'cog', label: 'Engranaje' },
  { name: 'settings', label: 'Ajustes' },
  { name: 'hammer', label: 'Martillo' },
  { name: 'gauge', label: 'Medidor' },
  { name: 'scan', label: 'Escanear' },
  // Estado / Indicadores
  { name: 'shield', label: 'Escudo' },
  { name: 'shield-check', label: 'Escudo check' },
  { name: 'circle-check', label: 'Check' },
  { name: 'triangle-alert', label: 'Alerta' },
  { name: 'flag', label: 'Bandera' },
  { name: 'star', label: 'Estrella' },
  { name: 'award', label: 'Premio' },
  { name: 'trophy', label: 'Trofeo' },
  { name: 'crown', label: 'Corona' },
  // Objetos
  { name: 'package', label: 'Paquete' },
  { name: 'box', label: 'Caja' },
  { name: 'tag', label: 'Etiqueta' },
  { name: 'key', label: 'Llave' },
  { name: 'lock', label: 'Candado' },
  { name: 'eye', label: 'Ojo' },
  { name: 'search', label: 'Buscar' },
  { name: 'layers', label: 'Capas' },
  { name: 'hash', label: 'Hash' },
  { name: 'circle', label: 'Círculo' },
  { name: 'zap', label: 'Rayo' },
  { name: 'target', label: 'Objetivo' },
];

type AdminTab = 'hitos' | 'config' | 'sla' | 'usuarios' | 'mapeo' | 'tipos';

// GET /v1/hitos → master hitos with subetapas
interface HitoMaster {
  id: number;
  nombre: string;
  carril: string;
  icono: string | null;
  subetapas: SubetapaMaster[];
}

interface SubetapaMaster {
  id: number;
  hitoId: number;
  nombre: string;
  campoStagingReal: string | null;
  campoStagingPlan: string | null;
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

interface TipoVehiculoApi {
  id: number;
  nombre: string;
  color: string;
  icono: string | null;
  activo: boolean;
}

interface FuenteVinApi {
  id: number;
  tipoFuente: string;
  rutaPatron: string;
  columnaVin: string;
  activo: boolean;
}

interface MapeoCampoApi {
  id: number;
  nombreCampo: string;
  idFuente: number;
  fuente: FuenteVinApi;
  nombreColumnaFuente: string;
  prioridad: number;
  activo: boolean;
}

interface StagingColumnInfo {
  name: string;
  type: 'fecha' | 'texto' | 'numero';
}

interface SlaConfigApi {
  id: number;
  empresaId: number | null;
  empresa: { id: number; nombre: string } | null;
  subetapaId: number | null;
  subetapa: { id: number; nombre: string; hitoId: number; hito?: { id: number; nombre: string } } | null;
  tipoVehiculoId: number | null;
  tipoVehiculo: { id: number; nombre: string } | null;
  diasObjetivo: number;
  diasTolerancia: number;
  diasCritico: number;
}



@Component({
    selector: 'kf-admin-page',
    imports: [FormsModule, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview, HitoConfigSwimlaneComponent, ProcessPreviewComponent, LucideAngularModule],
    template: `
    <div class="p-6 space-y-5">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Administración</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gestión de hitos, SLAs y usuarios</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-200 gap-1">
        @for (tab of visibleTabs(); track tab.id) {
          <button (click)="activeTab.set(tab.id)"
            class="px-5 py-2.5 text-sm font-medium transition-colors rounded-t-md flex items-center gap-1.5"
          [class]="activeTab() === tab.id
            ? (tab.superOnly ? 'bg-red-50 border border-b-white border-red-200 text-red-800 -mb-px' : 'bg-white border border-b-white border-slate-200 text-slate-800 -mb-px')
            : (tab.superOnly ? 'text-red-400 hover:text-red-600 hover:bg-red-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')"
          >
            @if (tab.superOnly) {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            }
            {{ tab.label }}
          </button>
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
              <div cdkDrag [cdkDragData]="hito" class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-visible relative">
                <!-- Hito header -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                  <!-- Drag handle -->
                  <span cdkDragHandle class="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing" title="Arrastrar para reordenar">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
                  </span>
                  <!-- Icon selector -->
                  <div class="relative" (click)="$event.stopPropagation()">
                    <button (click)="iconPickerHitoId.set(iconPickerHitoId() === hito.id ? null : hito.id)"
                      class="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      [class]="hito.icono ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'">
                      @if (hito.icono) {
                        <lucide-icon [name]="hito.icono" [size]="14" [strokeWidth]="2"></lucide-icon>
                      } @else {
                        <lucide-icon name="circle" [size]="14"></lucide-icon>
                      }
                    </button>
                    @if (iconPickerHitoId() === hito.id) {
                      <div class="absolute top-8 left-0 z-50 bg-white border border-slate-200 rounded-lg shadow-xl p-2 grid grid-cols-8 gap-1 w-72">
                        @for (ic of iconOptions; track ic.name) {
                          <button (click)="setHitoIcon(hito, ic.name)"
                            class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                            [class]="hito.icono === ic.name ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'"
                            [title]="ic.label">
                            <lucide-icon [name]="ic.name" [size]="16" [strokeWidth]="2"></lucide-icon>
                          </button>
                        }
                      </div>
                    }
                  </div>
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
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Campo Fecha Plan</th>
                        <th class="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Campo Fecha Real</th>
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
                              <select [ngModel]="editSubCampoPlan()" (ngModelChange)="editSubCampoPlan.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">— No asignado —</option>
                                @for (col of stagingVinColumns(); track col.value) {
                                  <option [value]="col.value">{{ col.label }}</option>
                                }
                              </select>
                            } @else {
                              @if (sub.campoStagingPlan) {
                                <code class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{{ sub.campoStagingPlan }}</code>
                              } @else {
                                <span class="text-xs text-slate-400">No asignado</span>
                              }
                            }
                          </td>
                          <td class="px-3 py-2.5">
                            @if (editingMasterSubId() === sub.id) {
                              <select [ngModel]="editSubCampoReal()" (ngModelChange)="editSubCampoReal.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">— No asignado —</option>
                                @for (col of stagingVinColumns(); track col.value) {
                                  <option [value]="col.value">{{ col.label }}</option>
                                }
                              </select>
                            } @else {
                              @if (sub.campoStagingReal) {
                                <code class="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">{{ sub.campoStagingReal }}</code>
                              } @else {
                                <span class="text-xs text-slate-400">No asignado</span>
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
                              <select [ngModel]="newSubCampoPlan()" (ngModelChange)="newSubCampoPlan.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">— No asignado —</option>
                                @for (col of stagingVinColumns(); track col.value) {
                                  <option [value]="col.value">{{ col.label }}</option>
                                }
                              </select>
                            </td>
                            <td class="px-3 py-2">
                              <select [ngModel]="newSubCampoReal()" (ngModelChange)="newSubCampoReal.set($event)"
                                class="text-xs border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">— No asignado —</option>
                                @for (col of stagingVinColumns(); track col.value) {
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
                            <td colspan="6" class="px-4 py-2">
                              <button (click)="addingSubToHitoId.set(hito.id); newSubNombre.set(''); newSubCampoReal.set(''); newSubCampoPlan.set('')"
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
              @for (tv of tipoVehiculoOptions(); track tv.id) {
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

            @if (auth.isAdmin()) {
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
                [isSuperAdmin]="auth.isAdmin()"
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
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-400">Reglas de Lead Time (SLA) por tipo de vehículo y subetapa. Objetivo = días meta, Tolerancia = días adicionales, Crítico = suma.</p>
            @if (auth.isAdmin()) {
              <button (click)="showNewSlaForm.set(true)"
                class="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 ml-4"
                [class.hidden]="showNewSlaForm()">
                + Nueva regla
              </button>
            }
          </div>

          <!-- Formulario nueva regla -->
          @if (showNewSlaForm() && auth.isAdmin()) {
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 class="text-xs font-semibold text-slate-700">Nueva Regla SLA</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Tipo Vehículo</label>
                  <select [ngModel]="newSlaTipoVehiculoId()" (ngModelChange)="newSlaTipoVehiculoId.set($event ? +$event : null)"
                    class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option [ngValue]="null">— Todos —</option>
                    @for (tv of tipoVehiculoOptions(); track tv.id) {
                      <option [ngValue]="tv.id">{{ tv.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Subetapa</label>
                  <select [ngModel]="newSlaSubetapaId()" (ngModelChange)="newSlaSubetapaId.set($event ? +$event : null)"
                    class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option [ngValue]="null">— Todas —</option>
                    @for (sub of allSubetapas(); track sub.id) {
                      <option [ngValue]="sub.id">{{ sub.hitoNombre }} → {{ sub.nombre }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Objetivo (días)</label>
                  <input type="number" [ngModel]="newSlaObjetivo()" (ngModelChange)="newSlaObjetivo.set(+$event)" min="1"
                    class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Tolerancia (días)</label>
                  <input type="number" [ngModel]="newSlaTolerance()" (ngModelChange)="newSlaTolerance.set(+$event)" min="0"
                    class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <!-- Alerta de regla existente -->
              @if (existingSlaMatch(); as match) {
                <div class="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                  <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <div class="text-xs">
                    <p class="font-semibold text-amber-800">Ya existe una regla para esta combinación</p>
                    <p class="text-amber-700 mt-0.5">
                      Objetivo: <span class="font-bold">{{ match.diasObjetivo }}d</span> ·
                      Tolerancia: <span class="font-bold">{{ match.diasTolerancia }}d</span> ·
                      Crítico: <span class="font-bold text-red-600">{{ match.diasCritico }}d</span>
                    </p>
                  </div>
                </div>
              }

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-xs">
                  <span class="text-slate-500">Crítico calculado:
                    <span class="font-bold text-red-600">{{ newSlaObjetivo() + newSlaTolerance() }}d</span>
                  </span>
                </div>
                <div class="flex gap-2">
                  <button (click)="showNewSlaForm.set(false)" class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  @if (existingSlaMatch()) {
                    <button (click)="updateExistingSla()" [disabled]="savingSla()"
                      class="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors">
                      {{ savingSla() ? 'Actualizando...' : 'Actualizar existente' }}
                    </button>
                  } @else {
                    <button (click)="createSlaRule()" [disabled]="savingSla()"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                      {{ savingSla() ? 'Guardando...' : 'Guardar' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          @if (loadingSla()) {
            <div class="flex justify-center py-8">
              <span class="text-slate-400 text-sm">Cargando reglas SLA...</span>
            </div>
          } @else {
            <!-- Filtros y búsqueda -->
            <div class="flex flex-wrap items-center gap-3">
              <input type="text" placeholder="Buscar por tipo, hito o subetapa..."
                [ngModel]="slaSearchQuery()" (ngModelChange)="slaSearchQuery.set($event)"
                class="flex-1 min-w-[200px] px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              <select [ngModel]="slaFilterTipoVehiculo()" (ngModelChange)="slaFilterTipoVehiculo.set($event ? +$event : null)"
                class="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option [ngValue]="null">Tipo: Todos</option>
                @for (tv of tipoVehiculoOptions(); track tv.id) {
                  <option [ngValue]="tv.id">{{ tv.label }}</option>
                }
              </select>
              <select [ngModel]="slaFilterHitoId()" (ngModelChange)="slaFilterHitoId.set($event !== '' && $event !== null ? +$event : null)"
                class="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option [ngValue]="null">Hito: Todos</option>
                @for (hito of slaHitoOptions(); track hito; let i = $index) {
                  <option [ngValue]="i">{{ hito }}</option>
                }
              </select>
              <span class="text-xs text-slate-400">{{ filteredSlaRules().length }} reglas</span>
            </div>

            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-center px-2 py-2.5 text-xs font-semibold text-slate-500 uppercase w-16">Prioridad</th>
                    <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Tipo Vehículo</th>
                    <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Hito</th>
                    <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Subetapa</th>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">
                      <span class="inline-flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Objetivo
                      </span>
                    </th>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">
                      <span class="inline-flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span> Tolerancia
                      </span>
                    </th>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">
                      <span class="inline-flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-red-500"></span> Crítico
                      </span>
                    </th>
                    @if (auth.isAdmin()) {
                      <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (sla of filteredSlaRules(); track sla.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <!-- Prioridad (score) -->
                      <td class="px-2 py-2.5 text-center">
                        @switch (slaScore(sla)) {
                          @case (3) { <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span> }
                          @case (2) { <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">2</span> }
                          @case (1) { <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">1</span> }
                          @default { <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">0</span> }
                        }
                      </td>
                      <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.tipoVehiculo?.nombre ?? '— Todos' }}</td>
                      <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.subetapa?.hito?.nombre ?? '— Todos' }}</td>
                      <td class="px-3 py-2.5 text-slate-600 text-xs">{{ sla.subetapa?.nombre ?? '— Todas' }}</td>

                      @if (editingSlaId() === sla.id) {
                        <td class="px-3 py-2.5 text-center">
                          <input type="number" [ngModel]="editSlaObjetivo()" (ngModelChange)="editSlaObjetivo.set(+$event)" min="1"
                            class="w-16 px-1.5 py-1 text-xs text-center border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <input type="number" [ngModel]="editSlaTolerance()" (ngModelChange)="editSlaTolerance.set(+$event)" min="0"
                            class="w-16 px-1.5 py-1 text-xs text-center border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500" />
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <span class="text-red-600 font-semibold text-xs">{{ editSlaObjetivo() + editSlaTolerance() }}d</span>
                        </td>
                        @if (auth.isAdmin()) {
                          <td class="px-3 py-2.5 text-center">
                            <div class="flex items-center justify-center gap-1">
                              <button (click)="saveSlaEdit(sla.id)" class="px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 rounded transition-colors">Guardar</button>
                              <button (click)="editingSlaId.set(null)" class="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded transition-colors">Cancelar</button>
                            </div>
                          </td>
                        }
                      } @else {
                        <td class="px-3 py-2.5 text-center">
                          <span class="text-emerald-700 font-semibold text-xs">{{ sla.diasObjetivo }}d</span>
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <span class="text-amber-600 font-semibold text-xs">+{{ sla.diasTolerancia }}d</span>
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <span class="text-red-600 font-semibold text-xs">{{ sla.diasCritico }}d</span>
                        </td>
                        @if (auth.isAdmin()) {
                          <td class="px-3 py-2.5 text-center">
                            @if (confirmDeleteSlaId() === sla.id) {
                              <div class="flex items-center justify-center gap-1">
                                <span class="text-xs text-red-600">¿Eliminar?</span>
                                <button (click)="deleteSlaRule(sla.id)" class="px-2 py-0.5 text-xs text-red-700 font-medium hover:bg-red-50 rounded">Sí</button>
                                <button (click)="confirmDeleteSlaId.set(null)" class="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded">No</button>
                              </div>
                            } @else {
                              <div class="flex items-center justify-center gap-1">
                                <button (click)="startEditSla(sla)" class="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">✏️</button>
                                <button (click)="confirmDeleteSlaId.set(sla.id)" class="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">🗑️</button>
                              </div>
                            }
                          </td>
                        }
                      }
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="px-4 py-8 text-center text-slate-400 text-xs">No hay reglas SLA que coincidan</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ═══ Tab 5: Mapeo Campos ═══ -->
      @if (activeTab() === 'mapeo') {
        <div class="space-y-3">
          <p class="text-xs text-slate-400">Mapeo de columnas de staging_vin hacia fuentes Excel. Arrastra los mapeos para reordenar la prioridad.</p>

          @if (loadingMapeo()) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span class="ml-2 text-sm text-slate-500">Cargando mapeo...</span>
            </div>
          } @else {
            <!-- Filtros -->
            <div class="space-y-2">
              <!-- Fila 1: Buscador + tipo de dato -->
              <div class="flex gap-3 items-center">
                <input type="text" placeholder="Buscar campo..." [ngModel]="mapeoSearch()" (ngModelChange)="mapeoSearch.set($event)"
                  class="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                <div class="flex gap-1">
                  <button (click)="mapeoFilterTipo.set('todos')"
                    class="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    [class]="mapeoFilterTipo() === 'todos' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">Todos</button>
                  <button (click)="mapeoFilterTipo.set('fecha')"
                    class="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    [class]="mapeoFilterTipo() === 'fecha' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'">Fecha</button>
                  <button (click)="mapeoFilterTipo.set('texto')"
                    class="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    [class]="mapeoFilterTipo() === 'texto' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'">Texto</button>
                  <button (click)="mapeoFilterTipo.set('numero')"
                    class="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    [class]="mapeoFilterTipo() === 'numero' ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'">Número</button>
                </div>
                <span class="text-xs text-slate-400 shrink-0">{{ filteredStagingColumns().length }} campos</span>
              </div>

              <!-- Fila 2: Filtro por número de fuentes -->
              <div class="flex gap-2 items-center">
                <span class="text-xs text-slate-400">N° fuentes:</span>
                <button (click)="mapeoFilterNumFuentes.set(null)"
                  class="px-2.5 py-1 text-xs font-medium rounded-full transition-colors"
                  [class]="mapeoFilterNumFuentes() === null ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                  Todas
                </button>
                @for (opt of numFuentesOptions(); track opt[0]) {
                  <button (click)="mapeoFilterNumFuentes.set(mapeoFilterNumFuentes() === opt[0] ? null : opt[0])"
                    class="px-2.5 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1"
                    [class]="mapeoFilterNumFuentes() === opt[0]
                      ? (opt[0] === 0 ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white')
                      : (opt[0] === 0 ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100')">
                    {{ opt[0] === 0 ? 'Sin mapeo' : opt[0] + ' fuente' + (opt[0] > 1 ? 's' : '') }}
                    <span class="opacity-70">({{ opt[1] }})</span>
                  </button>
                }
              </div>
            </div>

            <!-- Lista de campos -->
            <div class="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              @for (col of filteredStagingColumns(); track col.name) {
                @let mapeos = mapeosByCampo()[col.name] || [];
                <div class="bg-white">
                  <!-- Campo header -->
                  <button (click)="expandedCampo.set(expandedCampo() === col.name ? null : col.name)"
                    class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                    <div class="flex items-center gap-3">
                      <span class="font-mono text-sm text-slate-700">{{ col.name }}</span>
                      <span class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                        [class]="col.type === 'fecha' ? 'bg-amber-50 text-amber-600' : col.type === 'numero' ? 'bg-violet-50 text-violet-600' : 'bg-sky-50 text-sky-600'">{{ col.type }}</span>
                      @if (mapeos.length > 0) {
                        <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-50 text-blue-600">{{ mapeos.length }} fuente{{ mapeos.length > 1 ? 's' : '' }}</span>
                      } @else {
                        <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-600">Sin mapeo</span>
                      }
                    </div>
                    <svg class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="expandedCampo() === col.name" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <!-- Mapeos expandidos -->
                  @if (expandedCampo() === col.name) {
                    <div class="px-4 pb-3 space-y-2 bg-slate-50">
                      @if (mapeos.length > 0) {
                        <p class="text-[10px] text-slate-400 pt-1">Arrastra para reordenar prioridad (arriba = mayor prioridad)</p>
                        <div cdkDropList [cdkDropListData]="mapeos" (cdkDropListDropped)="onMapeoDropped($event, col.name)" class="space-y-1">
                          @for (m of mapeos; track m.id; let i = $index) {
                            <div cdkDrag class="flex items-center gap-3 bg-white border border-slate-200 rounded px-3 py-2 cursor-move hover:shadow-sm transition-shadow">
                              <!-- Drag handle + priority number -->
                              <div class="flex items-center gap-2 shrink-0">
                                <svg cdkDragHandle class="w-4 h-4 text-slate-300 cursor-grab" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8zm6 0h2v2h-2zM8 11h2v2H8zm6 0h2v2h-2zM8 16h2v2H8zm6 0h2v2h-2z"/></svg>
                                <span class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full" [class]="i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">{{ i + 1 }}</span>
                              </div>

                              @if (editingMapeoId() === m.id) {
                                <!-- Edit mode -->
                                <select [ngModel]="editMapeoFuenteId()" (ngModelChange)="editMapeoFuenteId.set(+$event)"
                                  class="px-2 py-1 text-xs border border-slate-200 rounded w-36">
                                  @for (f of fuentesVin(); track f.id) { <option [value]="f.id">{{ f.tipoFuente }}</option> }
                                </select>
                                <input [ngModel]="editMapeoColumna()" (ngModelChange)="editMapeoColumna.set($event)"
                                  class="flex-1 px-2 py-1 text-xs border border-slate-200 rounded" />
                                <label class="flex items-center gap-1 text-xs text-slate-500">
                                  <input type="checkbox" [ngModel]="editMapeoActivo()" (ngModelChange)="editMapeoActivo.set($event)" /> Activo
                                </label>
                                <button (click)="saveEditMapeo(m.id)" class="text-xs text-blue-600 hover:underline">Guardar</button>
                                <button (click)="editingMapeoId.set(null)" class="text-xs text-slate-400 hover:underline">Cancelar</button>
                              } @else {
                                <!-- View mode -->
                                <span class="px-1.5 py-0.5 text-xs rounded shrink-0"
                                  [class]="m.fuente.tipoFuente === 'Proped' ? 'bg-green-50 text-green-700' : m.fuente.tipoFuente === 'Reporte Fichas' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'">
                                  {{ m.fuente.tipoFuente }}
                                </span>
                                <span class="font-mono text-xs text-slate-600 flex-1">{{ m.nombreColumnaFuente }}</span>
                                @if (m.activo) {
                                  <span class="text-emerald-500 text-xs">●</span>
                                } @else {
                                  <span class="text-slate-300 text-xs">●</span>
                                }
                                <button (click)="startEditMapeo(m)" class="text-xs text-blue-600 hover:underline">Editar</button>
                                <button (click)="deleteMapeo(m.id)" class="text-xs text-red-500 hover:underline">Eliminar</button>
                              }
                            </div>
                          }
                        </div>
                      }

                      <!-- Add new mapping -->
                      @if (addingMapeoForCampo() === col.name) {
                        <div class="flex items-end gap-2 pt-2 border-t border-slate-200">
                          <div class="flex-1">
                            <label class="text-xs text-slate-400">Fuente</label>
                            <select [ngModel]="newMapeoFuenteId()" (ngModelChange)="newMapeoFuenteId.set(+$event)"
                              class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                              <option [value]="0" disabled>Seleccionar...</option>
                              @for (f of fuentesVin(); track f.id) { <option [value]="f.id">{{ f.tipoFuente }}</option> }
                            </select>
                          </div>
                          <div class="flex-1">
                            <label class="text-xs text-slate-400">Columna Excel</label>
                            <input [ngModel]="newMapeoColumna()" (ngModelChange)="newMapeoColumna.set($event)"
                              class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Nombre exacto (case-sensitive)" />
                          </div>
                          <button (click)="saveNewMapeo(col.name)" [disabled]="savingMapeo()"
                            class="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Guardar</button>
                          <button (click)="addingMapeoForCampo.set(null)" class="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Cancelar</button>
                        </div>
                      } @else {
                        <button (click)="addingMapeoForCampo.set(col.name); newMapeoFuenteId.set(0); newMapeoColumna.set('')"
                          class="text-xs text-blue-600 hover:underline mt-1">+ Agregar mapeo</button>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ═══ Tab: Tipos de Vehículo ═══ -->
      @if (activeTab() === 'tipos') {
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-400">Catálogo maestro de tipos de vehículo. Nombre, color, icono y estado.</p>
            <button (click)="showNewTipoForm.set(true)"
              class="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 ml-4"
              [class.hidden]="showNewTipoForm()">
              + Nuevo tipo
            </button>
          </div>

          <!-- Formulario nuevo tipo -->
          @if (showNewTipoForm()) {
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 class="text-xs font-semibold text-slate-700">Nuevo Tipo de Vehículo</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Nombre</label>
                  <input type="text" [ngModel]="newTipoNombre()" (ngModelChange)="newTipoNombre.set($event)"
                    class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Camión" />
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Color</label>
                  <div class="flex items-center gap-2">
                    <input type="color" [ngModel]="newTipoColor()" (ngModelChange)="newTipoColor.set($event)"
                      class="w-8 h-8 rounded border border-slate-200 cursor-pointer" />
                    <input type="text" [ngModel]="newTipoColor()" (ngModelChange)="newTipoColor.set($event)"
                      class="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg font-mono" />
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-600 block mb-1">Icono</label>
                  <div class="relative">
                    <button (click)="tipoIconPickerOpen.set(!tipoIconPickerOpen())"
                      class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                      @if (newTipoIcono()) {
                        <lucide-icon [name]="newTipoIcono()!" [size]="14"></lucide-icon>
                        <span class="font-mono">{{ newTipoIcono() }}</span>
                      } @else {
                        <span class="text-slate-400">Seleccionar...</span>
                      }
                    </button>
                    @if (tipoIconPickerOpen()) {
                      <div class="absolute top-8 left-0 z-50 bg-white border border-slate-200 rounded-lg shadow-xl p-2 grid grid-cols-8 gap-1 w-72">
                        @for (ic of iconOptions; track ic.name) {
                          <button (click)="newTipoIcono.set(ic.name); tipoIconPickerOpen.set(false)"
                            class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                            [class]="newTipoIcono() === ic.name ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'"
                            [title]="ic.label">
                            <lucide-icon [name]="ic.name" [size]="16" [strokeWidth]="2"></lucide-icon>
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
                <div class="flex items-end">
                  <div class="flex gap-2">
                    <button (click)="createTipoVehiculo()" [disabled]="!newTipoNombre().trim()"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Guardar</button>
                    <button (click)="showNewTipoForm.set(false)"
                      class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          }

          @if (loadingTipos()) {
            <div class="flex justify-center py-8"><span class="text-slate-400 text-sm">Cargando tipos...</span></div>
          } @else {
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-visible">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-12">Icono</th>
                    <th class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-20">Color</th>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-16">Activo</th>
                    <th class="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tv of tiposVehiculo(); track tv.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      @if (editingTipoId() === tv.id) {
                        <!-- Edit mode -->
                        <td class="px-3 py-2.5 text-center">
                          <div class="relative inline-block">
                            <button (click)="editTipoIconPickerOpen.set(!editTipoIconPickerOpen())"
                              class="w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-200 hover:border-blue-400 transition-colors"
                              [style.color]="editTipoColor()">
                              @if (editTipoIcono()) {
                                <lucide-icon [name]="editTipoIcono()!" [size]="16"></lucide-icon>
                              } @else {
                                <lucide-icon name="circle" [size]="16"></lucide-icon>
                              }
                            </button>
                            @if (editTipoIconPickerOpen()) {
                              <div class="absolute top-9 left-0 z-50 bg-white border border-slate-200 rounded-lg shadow-xl p-2 grid grid-cols-8 gap-1 w-72">
                                @for (ic of iconOptions; track ic.name) {
                                  <button (click)="editTipoIcono.set(ic.name); editTipoIconPickerOpen.set(false)"
                                    class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                                    [class]="editTipoIcono() === ic.name ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'"
                                    [title]="ic.label">
                                    <lucide-icon [name]="ic.name" [size]="16" [strokeWidth]="2"></lucide-icon>
                                  </button>
                                }
                              </div>
                            }
                          </div>
                        </td>
                        <td class="px-3 py-2.5">
                          <input type="text" [ngModel]="editTipoNombre()" (ngModelChange)="editTipoNombre.set($event)"
                            class="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <input type="color" [ngModel]="editTipoColor()" (ngModelChange)="editTipoColor.set($event)"
                            class="w-8 h-8 rounded border border-slate-200 cursor-pointer" />
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <input type="checkbox" [ngModel]="editTipoActivo()" (ngModelChange)="editTipoActivo.set($event)" />
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <div class="flex items-center justify-center gap-1">
                            <button (click)="saveTipoEdit(tv.id)" class="text-xs text-emerald-700 hover:underline">Guardar</button>
                            <button (click)="editingTipoId.set(null); editTipoIconPickerOpen.set(false)" class="text-xs text-slate-400 hover:underline">Cancelar</button>
                          </div>
                        </td>
                      } @else {
                        <!-- View mode -->
                        <td class="px-3 py-2.5 text-center">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center mx-auto border-2" [style.border-color]="tv.color" [style.color]="tv.color">
                            @if (tv.icono) {
                              <lucide-icon [name]="tv.icono" [size]="16"></lucide-icon>
                            } @else {
                              <lucide-icon name="circle" [size]="16"></lucide-icon>
                            }
                          </div>
                        </td>
                        <td class="px-3 py-2.5 font-medium text-slate-800">{{ tv.nombre }}</td>
                        <td class="px-3 py-2.5 text-center">
                          <span class="inline-block w-5 h-5 rounded-full border border-slate-200" [style.background-color]="tv.color"></span>
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <span class="text-xs" [class]="tv.activo ? 'text-emerald-500' : 'text-slate-300'">●</span>
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <button (click)="startEditTipo(tv)" class="text-xs text-blue-600 hover:underline">Editar</button>
                        </td>
                      }
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400 text-sm">No hay tipos de vehículo</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
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
                    @if (auth.isAdmin()) {
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
                      @if (auth.isAdmin()) {
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

  activeTab = signal<AdminTab>('sla');
  tabs = [
    { id: 'sla' as AdminTab, label: 'Config por SLA', superOnly: false },
    { id: 'config' as AdminTab, label: 'Config por Tipo', superOnly: false },
    { id: 'usuarios' as AdminTab, label: 'Usuarios', superOnly: false },
    { id: 'tipos' as AdminTab, label: 'Tipos Vehículo', superOnly: true },
    { id: 'hitos' as AdminTab, label: 'Hitos Maestros', superOnly: true },
    { id: 'mapeo' as AdminTab, label: 'Mapeo Campos', superOnly: true },
  ];

  visibleTabs = computed(() =>
    this.tabs.filter(t => !t.superOnly || this.auth.isSuperAdmin())
  );

  // ── Tab 1: Hitos Maestros ──
  hitosMaster = signal<HitoMaster[]>([]);
  loadingMaster = signal(false);
  expandedMasterHitoId = signal<number | null>(null);
  iconPickerHitoId = signal<number | null>(null);
  iconOptions = ICON_OPTIONS;
  stagingVinColumns = computed(() =>
    this.stagingColumns().map(c => ({ value: c.name, label: c.name }))
  );
  editingMasterSubId = signal<number | null>(null);
  editSubNombre = signal('');
  editSubCampoReal = signal('');
  editSubCampoPlan = signal('');
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
  newSubCampoReal = signal('');
  newSubCampoPlan = signal('');
  savingNewSub = signal(false);

  // Delete subetapa
  confirmDeleteSubId = signal<number | null>(null);

  // ── Tab 2: Config por Tipo ──
  private readonly tvService = inject(TipoVehiculoService);
  tipoVehiculoOptions = computed(() =>
    this.tvService.items().map(tv => ({ id: tv.id, label: tv.nombre }))
  );
  selectedTipoVehiculo = signal(1);
  hitoConfigs = signal<HitoConfigView[]>([]);
  gruposParalelos = signal<GrupoParaleloApi[]>([]);
  loadingConfig = signal(false);
  showPreview = signal(false);
  showResetConfirm = signal(false);
  resetting = signal(false);

  // ── Tab 3: SLA ──
  slaRules = signal<SlaConfigApi[]>([]);
  slaLoaded = signal(false);
  loadingSla = signal(false);
  showNewSlaForm = signal(false);
  savingSla = signal(false);
  newSlaTipoVehiculoId = signal<number | null>(null);
  newSlaSubetapaId = signal<number | null>(null);
  newSlaObjetivo = signal(5);
  newSlaTolerance = signal(2);
  editingSlaId = signal<number | null>(null);
  editSlaObjetivo = signal(0);
  editSlaTolerance = signal(0);
  confirmDeleteSlaId = signal<number | null>(null);

  /** Detects if an existing SLA rule matches the current new form selections */
  existingSlaMatch = computed(() => {
    const tipoId = this.newSlaTipoVehiculoId();
    const subId = this.newSlaSubetapaId();
    if (!this.showNewSlaForm()) return null;
    return this.slaRules().find(s =>
      (s.tipoVehiculoId || null) === (tipoId || null) &&
      (s.subetapaId || null) === (subId || null)
    ) || null;
  });
  allSubetapas = signal<{ id: number; nombre: string; hitoNombre: string }[]>([]);
  slaSearchQuery = signal('');
  slaFilterTipoVehiculo = signal<number | null>(null);
  slaFilterHitoId = signal<number | null>(null);

  // Hitos únicos para el filtro (derivados de allSubetapas)
  slaHitoOptions = computed(() => {
    const subs = this.allSubetapas();
    const seen = new Map<string, string>();
    for (const s of subs) {
      if (!seen.has(s.hitoNombre)) seen.set(s.hitoNombre, s.hitoNombre);
    }
    return [...seen.keys()];
  });

  // Score helper
  slaScore(sla: SlaConfigApi): number {
    return [sla.empresaId, sla.subetapaId, sla.tipoVehiculoId].filter(v => v != null).length;
  }

  // Filtered + sorted SLA rules
  filteredSlaRules = computed(() => {
    let rules = this.slaRules();
    const query = this.slaSearchQuery().toLowerCase().trim();
    const filterTv = this.slaFilterTipoVehiculo();
    const filterHito = this.slaFilterHitoId();

    if (filterTv !== null) {
      rules = rules.filter(r => r.tipoVehiculoId === filterTv);
    }
    if (filterHito !== null) {
      const hitoName = this.slaHitoOptions()[filterHito] ?? '';
      rules = rules.filter(r => r.subetapa?.hito?.nombre === hitoName);
    }
    if (query) {
      rules = rules.filter(r => {
        const tv = (r.tipoVehiculo?.nombre ?? 'todos').toLowerCase();
        const sub = (r.subetapa?.nombre ?? 'todas').toLowerCase();
        const hito = (r.subetapa?.hito?.nombre ?? '').toLowerCase();
        return tv.includes(query) || sub.includes(query) || hito.includes(query);
      });
    }
    // Sort by score desc, then by tipo vehiculo name, then subetapa
    return [...rules].sort((a, b) => {
      const scoreDiff = this.slaScore(b) - this.slaScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      const tvA = a.tipoVehiculo?.nombre ?? '';
      const tvB = b.tipoVehiculo?.nombre ?? '';
      if (tvA !== tvB) return tvA.localeCompare(tvB);
      const subA = a.subetapa?.nombre ?? '';
      const subB = b.subetapa?.nombre ?? '';
      return subA.localeCompare(subB);
    });
  });

  // ── Tab: Tipos de Vehículo ──
  tiposVehiculo = signal<TipoVehiculoApi[]>([]);
  loadingTipos = signal(false);
  showNewTipoForm = signal(false);
  tipoIconPickerOpen = signal(false);
  newTipoNombre = signal('');
  newTipoColor = signal('#2E75B6');
  newTipoIcono = signal<string | null>(null);
  editingTipoId = signal<number | null>(null);
  editTipoNombre = signal('');
  editTipoColor = signal('');
  editTipoIcono = signal<string | null>(null);
  editTipoActivo = signal(true);
  editTipoIconPickerOpen = signal(false);

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

  // ── Tab 5: Mapeo Campos ──
  stagingColumns = signal<StagingColumnInfo[]>([]);
  fuentesVin = signal<FuenteVinApi[]>([]);
  mapeosByCampo = signal<Record<string, MapeoCampoApi[]>>({});
  loadingMapeo = signal(false);
  mapeoLoaded = signal(false);
  expandedCampo = signal<string | null>(null);
  mapeoSearch = signal('');
  mapeoFilterTipo = signal<'todos' | 'fecha' | 'texto' | 'numero'>('todos');
  mapeoFilterNumFuentes = signal<number | null>(null); // null = all, 0 = sin mapeo, 1 = 1 fuente, etc.
  // Add form
  addingMapeoForCampo = signal<string | null>(null);
  newMapeoFuenteId = signal(0);
  newMapeoColumna = signal('');
  savingMapeo = signal(false);
  // Edit form
  editingMapeoId = signal<number | null>(null);
  editMapeoFuenteId = signal(0);
  editMapeoColumna = signal('');
  editMapeoActivo = signal(true);

  filteredStagingColumns = computed(() => {
    const q = this.mapeoSearch().toLowerCase();
    const tipo = this.mapeoFilterTipo();
    const numFuentes = this.mapeoFilterNumFuentes();
    const grouped = this.mapeosByCampo();
    let cols = this.stagingColumns();
    if (q) cols = cols.filter(c => c.name.toLowerCase().includes(q));
    if (tipo !== 'todos') cols = cols.filter(c => c.type === tipo);
    if (numFuentes !== null) {
      cols = cols.filter(c => (grouped[c.name] || []).length === numFuentes);
    }
    return cols;
  });

  /** Distinct counts of how many campos have 0, 1, 2, 3... fuentes (filtered by tipo + search) */
  numFuentesOptions = computed(() => {
    const grouped = this.mapeosByCampo();
    const q = this.mapeoSearch().toLowerCase();
    const tipo = this.mapeoFilterTipo();
    let cols = this.stagingColumns();
    if (q) cols = cols.filter(c => c.name.toLowerCase().includes(q));
    if (tipo !== 'todos') cols = cols.filter(c => c.type === tipo);
    const countMap = new Map<number, number>();
    for (const col of cols) {
      const n = (grouped[col.name] || []).length;
      countMap.set(n, (countMap.get(n) || 0) + 1);
    }
    return Array.from(countMap.entries()).sort((a, b) => a[0] - b[0]);
  });

  constructor() {
    // Close all icon pickers when switching tabs
    effect(() => {
      this.activeTab(); // track
      this.iconPickerHitoId.set(null);
      this.tipoIconPickerOpen.set(false);
      this.editTipoIconPickerOpen.set(false);
    });

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
    // Load SLA when tab opens
    effect(() => {
      if (this.activeTab() === 'sla' && !this.slaLoaded()) {
        this.loadSlaRules();
      }
    });
    // Load users when tab opens
    effect(() => {
      if (this.activeTab() === 'usuarios' && this.users().length === 0) {
        this.loadUsers();
      }
    });
    // Load mapeo when tab opens
    effect(() => {
      if (this.activeTab() === 'mapeo' && !this.mapeoLoaded()) {
        this.loadMapeoData();
      }
    });
    // Load tipos when tab opens
    effect(() => {
      if (this.activeTab() === 'tipos' && this.tiposVehiculo().length === 0) {
        this.loadTiposVehiculo();
      }
    });
  }

  ngOnInit() {
    this.tvService.load();
    this.loadEmpresas();
    this.loadGruposParalelos();
    this.loadStagingColumns();
  }

  private async loadStagingColumns() {
    if (this.stagingColumns().length > 0) return;
    try {
      const cols = await firstValueFrom(
        this.http.get<StagingColumnInfo[]>(`${this.apiUrl}/v1/mapeo-campos-vin/staging-columns`)
      );
      this.stagingColumns.set(cols);
    } catch (err) { console.error('Error loading staging columns:', err); }
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
    this.iconPickerHitoId.set(null);
    this.editingMasterSubId.set(null);
    this.expandedMasterHitoId.set(this.expandedMasterHitoId() === hitoId ? null : hitoId);
  }

  startMasterSubEdit(sub: SubetapaMaster): void {
    this.editingMasterSubId.set(sub.id);
    this.editSubNombre.set(sub.nombre);
    this.editSubCampoReal.set(sub.campoStagingReal ?? '');
    this.editSubCampoPlan.set(sub.campoStagingPlan ?? '');
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
          campoStagingReal: this.editSubCampoReal() || null,
          campoStagingPlan: this.editSubCampoPlan() || null,
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
  async setHitoIcon(hito: HitoMaster, iconName: string): Promise<void> {
    this.iconPickerHitoId.set(null);
    // Optimistic update
    this.hitosMaster.set(this.hitosMaster().map(h => h.id === hito.id ? { ...h, icono: iconName } : h));
    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/v1/hitos/${hito.id}`, { icono: iconName }));
    } catch (err) {
      console.error('Error updating icon:', err);
      await this.loadMasterHitos();
    }
  }

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
          campoStagingReal: this.newSubCampoReal() || null,
          campoStagingPlan: this.newSubCampoPlan() || null,
          orden: (hito?.subetapas.length ?? 0) + 1,
        })
      );
      this.addingSubToHitoId.set(null);
      this.newSubNombre.set('');
      this.newSubCampoReal.set(''); this.newSubCampoPlan.set('');
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
    return this.tipoVehiculoOptions().find(t => t.id === id)?.label ?? '';
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
  // Tab 3: SLA Config
  // ══════════════════════════════════════════

  async loadSlaRules(): Promise<void> {
    this.loadingSla.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<SlaConfigApi[]>(`${this.apiUrl}/v1/sla`)
      );
      this.slaRules.set(data);
      // Also load subetapas for the dropdown
      if (this.allSubetapas().length === 0) {
        await this.loadAllSubetapas();
      }
    } catch (err) {
      console.error('Error loading SLA rules:', err);
    } finally {
      this.slaLoaded.set(true);
      this.loadingSla.set(false);
    }
  }

  async loadAllSubetapas(): Promise<void> {
    try {
      const hitos = await firstValueFrom(
        this.http.get<HitoMaster[]>(`${this.apiUrl}/v1/hitos`)
      );
      const subs: { id: number; nombre: string; hitoNombre: string }[] = [];
      for (const h of hitos) {
        for (const s of h.subetapas || []) {
          subs.push({ id: s.id, nombre: s.nombre, hitoNombre: h.nombre });
        }
      }
      this.allSubetapas.set(subs);
    } catch (err) {
      console.error('Error loading subetapas:', err);
    }
  }

  async createSlaRule(): Promise<void> {
    this.savingSla.set(true);
    try {
      const body: any = {
        diasObjetivo: this.newSlaObjetivo(),
        diasTolerancia: this.newSlaTolerance(),
      };
      if (this.newSlaTipoVehiculoId()) body.tipoVehiculoId = this.newSlaTipoVehiculoId();
      if (this.newSlaSubetapaId()) body.subetapaId = this.newSlaSubetapaId();

      await firstValueFrom(
        this.http.post(`${this.apiUrl}/v1/sla`, body)
      );
      this.showNewSlaForm.set(false);
      this.newSlaTipoVehiculoId.set(null);
      this.newSlaSubetapaId.set(null);
      this.newSlaObjetivo.set(5);
      this.newSlaTolerance.set(2);
      await this.loadSlaRules();
    } catch (err) {
      console.error('Error creating SLA rule:', err);
    } finally {
      this.savingSla.set(false);
    }
  }

  async updateExistingSla(): Promise<void> {
    const match = this.existingSlaMatch();
    if (!match) return;
    this.savingSla.set(true);
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/v1/sla/${match.id}`, {
          diasObjetivo: this.newSlaObjetivo(),
          diasTolerancia: this.newSlaTolerance(),
        })
      );
      this.showNewSlaForm.set(false);
      this.newSlaTipoVehiculoId.set(null);
      this.newSlaSubetapaId.set(null);
      this.newSlaObjetivo.set(5);
      this.newSlaTolerance.set(2);
      await this.loadSlaRules();
    } catch (err) {
      console.error('Error updating existing SLA rule:', err);
    } finally {
      this.savingSla.set(false);
    }
  }

  startEditSla(sla: SlaConfigApi): void {
    this.editingSlaId.set(sla.id);
    this.editSlaObjetivo.set(sla.diasObjetivo);
    this.editSlaTolerance.set(sla.diasTolerancia);
  }

  async saveSlaEdit(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/v1/sla/${id}`, {
          diasObjetivo: this.editSlaObjetivo(),
          diasTolerancia: this.editSlaTolerance(),
        })
      );
      this.editingSlaId.set(null);
      await this.loadSlaRules();
    } catch (err) {
      console.error('Error updating SLA rule:', err);
    }
  }

  async deleteSlaRule(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/v1/sla/${id}`)
      );
      this.confirmDeleteSlaId.set(null);
      this.slaRules.update(rules => rules.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting SLA rule:', err);
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

  // ── Tab 5: Mapeo Campos ──

  async loadMapeoData(silent = false) {
    if (!silent) this.loadingMapeo.set(true);
    try {
      const [columns, fuentes, grouped] = await Promise.all([
        firstValueFrom(this.http.get<StagingColumnInfo[]>(`${this.apiUrl}/v1/mapeo-campos-vin/staging-columns`)),
        firstValueFrom(this.http.get<FuenteVinApi[]>(`${this.apiUrl}/v1/fuentes-vin`)),
        firstValueFrom(this.http.get<Record<string, MapeoCampoApi[]>>(`${this.apiUrl}/v1/mapeo-campos-vin/grouped`)),
      ]);
      this.stagingColumns.set(columns);
      this.fuentesVin.set(fuentes);
      this.mapeosByCampo.set(grouped);
      this.mapeoLoaded.set(true);
    } catch (err) { console.error('Error loading mapeo data:', err); }
    finally { if (!silent) this.loadingMapeo.set(false); }
  }

  startEditMapeo(m: MapeoCampoApi) {
    this.editingMapeoId.set(m.id);
    this.editMapeoFuenteId.set(m.idFuente);
    this.editMapeoColumna.set(m.nombreColumnaFuente);
    this.editMapeoActivo.set(m.activo);
  }

  async saveEditMapeo(id: number) {
    const fuente = this.fuentesVin().find(f => f.id === this.editMapeoFuenteId());
    // Optimistic update
    this.mapeosByCampo.update(grouped => {
      const result = { ...grouped };
      for (const [campo, mapeos] of Object.entries(result)) {
        const idx = mapeos.findIndex(m => m.id === id);
        if (idx >= 0) {
          const updated = [...mapeos];
          updated[idx] = {
            ...updated[idx],
            idFuente: this.editMapeoFuenteId(),
            nombreColumnaFuente: this.editMapeoColumna(),
            activo: this.editMapeoActivo(),
            fuente: fuente || updated[idx].fuente,
          };
          result[campo] = updated;
          break;
        }
      }
      return result;
    });
    this.editingMapeoId.set(null);

    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/v1/mapeo-campos-vin/${id}`, {
        idFuente: this.editMapeoFuenteId(),
        nombreColumnaFuente: this.editMapeoColumna(),
        activo: this.editMapeoActivo(),
      }));
      await this.loadMapeoData(true);
    } catch (err) { console.error('Error updating mapeo:', err); }
  }

  async saveNewMapeo(campo: string) {
    if (!this.newMapeoFuenteId() || !this.newMapeoColumna()) return;
    const existing = this.mapeosByCampo()[campo] || [];
    const nextPriority = existing.length > 0 ? Math.max(...existing.map(m => m.prioridad)) + 1 : 1;
    const fuente = this.fuentesVin().find(f => f.id === this.newMapeoFuenteId());

    // Optimistic update — add a temporary entry
    const tempMapeo: MapeoCampoApi = {
      id: -Date.now(),
      nombreCampo: campo,
      idFuente: this.newMapeoFuenteId(),
      fuente: fuente!,
      nombreColumnaFuente: this.newMapeoColumna(),
      prioridad: nextPriority,
      activo: true,
    };
    this.mapeosByCampo.update(grouped => ({
      ...grouped,
      [campo]: [...(grouped[campo] || []), tempMapeo],
    }));
    this.addingMapeoForCampo.set(null);

    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/v1/mapeo-campos-vin`, {
        nombreCampo: campo,
        idFuente: this.newMapeoFuenteId(),
        nombreColumnaFuente: this.newMapeoColumna(),
        prioridad: nextPriority,
        activo: true,
      }));
      await this.loadMapeoData(true);
    } catch (err) { console.error('Error creating mapeo:', err); }
  }

  async deleteMapeo(id: number) {
    // Optimistic update — remove from signal
    this.mapeosByCampo.update(grouped => {
      const result = { ...grouped };
      for (const [campo, mapeos] of Object.entries(result)) {
        const idx = mapeos.findIndex(m => m.id === id);
        if (idx >= 0) {
          result[campo] = mapeos.filter(m => m.id !== id);
          break;
        }
      }
      return result;
    });

    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/v1/mapeo-campos-vin/${id}`));
      await this.loadMapeoData(true);
    } catch (err) { console.error('Error deleting mapeo:', err); }
  }

  async onMapeoDropped(event: CdkDragDrop<MapeoCampoApi[]>, campo: string) {
    const mapeos = [...(this.mapeosByCampo()[campo] || [])];
    moveItemInArray(mapeos, event.previousIndex, event.currentIndex);
    // Optimistic UI update
    this.mapeosByCampo.update(grouped => ({ ...grouped, [campo]: mapeos }));

    const orderedIds = mapeos.map(m => m.id);
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/v1/mapeo-campos-vin/reorder`, { nombreCampo: campo, orderedIds }));
      await this.loadMapeoData(true);
    } catch (err) { console.error('Error reordering:', err); }
  }

  // ── Tab: Tipos de Vehículo ──

  async loadTiposVehiculo() {
    this.loadingTipos.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<TipoVehiculoApi[]>(`${this.apiUrl}/v1/tipo-vehiculo/all`)
      );
      this.tiposVehiculo.set(data);
    } catch (err) { console.error('Error loading tipos:', err); }
    finally { this.loadingTipos.set(false); }
  }

  startEditTipo(tv: TipoVehiculoApi) {
    this.editingTipoId.set(tv.id);
    this.editTipoNombre.set(tv.nombre);
    this.editTipoColor.set(tv.color);
    this.editTipoIcono.set(tv.icono);
    this.editTipoActivo.set(tv.activo);
    this.editTipoIconPickerOpen.set(false);
  }

  async saveTipoEdit(id: number) {
    // Optimistic
    this.tiposVehiculo.update(list => list.map(tv => tv.id === id ? {
      ...tv,
      nombre: this.editTipoNombre(),
      color: this.editTipoColor(),
      icono: this.editTipoIcono(),
      activo: this.editTipoActivo(),
    } : tv));
    this.editingTipoId.set(null);
    this.editTipoIconPickerOpen.set(false);

    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/v1/tipo-vehiculo/${id}`, {
        nombre: this.editTipoNombre(),
        color: this.editTipoColor(),
        icono: this.editTipoIcono(),
        activo: this.editTipoActivo(),
      }));
      this.tvService.load(true); // refresh shared cache
    } catch (err) {
      console.error('Error updating tipo:', err);
      await this.loadTiposVehiculo();
    }
  }

  async createTipoVehiculo() {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/v1/tipo-vehiculo`, {
        nombre: this.newTipoNombre(),
        color: this.newTipoColor(),
        icono: this.newTipoIcono(),
      }));
      this.showNewTipoForm.set(false);
      this.newTipoNombre.set('');
      this.newTipoColor.set('#2E75B6');
      this.newTipoIcono.set(null);
      this.tipoIconPickerOpen.set(false);
      await this.loadTiposVehiculo();
      this.tvService.load(true); // refresh shared cache
    } catch (err) { console.error('Error creating tipo:', err); }
  }
}
