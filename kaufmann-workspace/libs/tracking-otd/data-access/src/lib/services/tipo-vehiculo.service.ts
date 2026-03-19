import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '@kaufmann/shared/auth';
import { TipoVehiculoModel } from '@kaufmann/shared/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TipoVehiculoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  readonly items = signal<TipoVehiculoModel[]>([]);
  private loaded = false;

  async load(force = false): Promise<TipoVehiculoModel[]> {
    if (!force && this.loaded && this.items().length > 0) return this.items();
    try {
      const data = await firstValueFrom(
        this.http.get<TipoVehiculoModel[]>(`${this.apiUrl}/v1/tipo-vehiculo`)
      );
      this.items.set(data);
      this.loaded = true;
      return data;
    } catch (err) {
      console.error('Error loading tipos de vehículo:', err);
      return [];
    }
  }
}
