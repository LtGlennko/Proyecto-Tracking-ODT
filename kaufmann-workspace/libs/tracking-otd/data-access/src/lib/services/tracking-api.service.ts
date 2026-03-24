import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '@kaufmann/shared/auth';
import { ClienteModel } from '@kaufmann/shared/models';

export interface TrackingClientesFilters {
  empresaId?: number;
  estado?: string;
  tipoVehiculoId?: number;
  busqueda?: string;
  page?: number;
  pageSize?: number;
}

export interface TrackingSummary {
  total: number;
  demorado: number;
}

export interface PaginatedResponse<T> {
  data: T;
  total: number;
  page: number;
  pageSize: number;
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
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.pageSize) params = params.set('pageSize', filters.pageSize);

    return this.http.get<PaginatedResponse<ClienteModel[]>>(`${this.apiUrl}/v1/tracking/clientes`, { params });
  }

  getSummary(filters?: { empresaId?: number; tipoVehiculoId?: number; busqueda?: string }) {
    let params = new HttpParams();
    if (filters?.empresaId) params = params.set('empresaId', filters.empresaId);
    if (filters?.tipoVehiculoId) params = params.set('tipoVehiculoId', filters.tipoVehiculoId);
    if (filters?.busqueda) params = params.set('busqueda', filters.busqueda);

    return this.http.get<TrackingSummary>(`${this.apiUrl}/v1/tracking/summary`, { params });
  }
}
