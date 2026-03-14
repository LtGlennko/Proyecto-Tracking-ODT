import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '@kaufmann/shared/auth';
import { ClienteModel } from '@kaufmann/shared/models';

export interface TrackingClientesFilters {
  empresaId?: number;
  estado?: string;
  tipoVehiculoId?: number;
  busqueda?: string;
}

@Injectable({ providedIn: 'root' })
export class TrackingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getClientesHierarchy(filters?: TrackingClientesFilters) {
    let params = new HttpParams();
    if (filters?.empresaId) params = params.set('empresaId', filters.empresaId);
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.tipoVehiculoId) params = params.set('tipoVehiculoId', filters.tipoVehiculoId);
    if (filters?.busqueda) params = params.set('busqueda', filters.busqueda);

    return this.http.get<ClienteModel[]>(`${this.apiUrl}/v1/tracking/clientes`, { params });
  }
}
