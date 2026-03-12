import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';

export interface EmpresaOption {
  id: number;
  nombre: string;
  codigo: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresaFilterService {
  private readonly auth = inject(AuthService);

  /** The currently selected empresa ID, or null for "Todas" */
  private readonly _selectedId = signal<number | null>(null);

  /** Empresas the user has access to (from DB via AuthService) */
  availableEmpresas = computed<EmpresaOption[]>(() => {
    return this.auth.currentUser()?.empresas ?? [];
  });

  /** Currently selected empresa ID */
  selectedEmpresaId = this._selectedId.asReadonly();

  /** Currently selected empresa name (for display), or null */
  selectedEmpresaNombre = computed(() => {
    const id = this._selectedId();
    if (id === null) return null;
    return this.availableEmpresas().find(e => e.id === id)?.nombre ?? null;
  });

  select(empresaId: number | null): void {
    this._selectedId.set(empresaId);
  }
}
