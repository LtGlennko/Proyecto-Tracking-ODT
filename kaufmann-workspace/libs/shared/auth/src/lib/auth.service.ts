import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export type UserRole = 'superadministrador' | 'administrador' | 'asesor_comercial' | 'supervisor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  empresas: { id: number; nombre: string; codigo: string }[];
}

const STORAGE_KEY = 'td-id-token';

interface MicrosoftLoginResponse {
  url: string;
}

interface MicrosoftCallbackResponse {
  accessToken: string;
  idToken: string;
  expiresOn: string;
  account: {
    homeAccountId: string;
    username: string;
    name: string;
    tenantId: string;
    environment: string;
  };
  scopes: string[];
  tokenType: string;
}

interface MeResponse {
  id: number;
  azureAdOid: string;
  nombre: string;
  email: string;
  perfil: string;
  activo: boolean;
  empresas: { id: number; nombre: string; codigo: string }[];
}

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly _token = signal<string | null>(null);
  private readonly _currentUser = signal<AuthUser | null>(null);

  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => this._currentUser() !== null);
  isAdmin = computed(() => {
    const role = this._currentUser()?.role;
    return role === 'administrador' || role === 'superadministrador';
  });
  isSuperAdmin = computed(() => this._currentUser()?.role === 'superadministrador');

  constructor() {
    this.loadFromStorage();
  }

  getAccessToken(): string | null {
    return this._token();
  }

  async startMicrosoftLogin(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<MicrosoftLoginResponse>(`${this.apiUrl}/v1/auth/microsoft/login`)
      );
      if (!response?.url) {
        throw new Error('Missing login URL.');
      }
      globalThis.location.assign(response.url);
    } catch (error) {
      console.error('Auth login failed:', error);
    }
  }

  async handleMicrosoftCallback(code: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<MicrosoftCallbackResponse>(
          `${this.apiUrl}/v1/auth/microsoft/callback`,
          { params: { code } }
        )
      );
      if (!response?.idToken) {
        throw new Error('Missing id token.');
      }

      this.setToken(response.idToken);

      // Sync user in backend
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/v1/auth/sync`, {}, {
          headers: { Authorization: `Bearer ${response.idToken}` }
        })
      );

      // Fetch real user profile from DB (includes perfil and empresas)
      await this.fetchMe();

      return true;
    } catch (error) {
      console.error('Auth callback failed:', error);
      return false;
    }
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }

  async refreshProfile(): Promise<void> {
    return this.fetchMe();
  }

  private async fetchMe(): Promise<void> {
    try {
      const me = await firstValueFrom(
        this.http.get<MeResponse>(`${this.apiUrl}/v1/auth/me`)
      );
      if (me) {
        this._currentUser.set({
          id: me.azureAdOid || String(me.id),
          name: me.nombre || '',
          email: me.email || '',
          role: (me.perfil || 'asesor_comercial') as UserRole,
          initials: buildInitials(me.nombre || ''),
          empresas: me.empresas || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }

  private setToken(token: string): void {
    this._token.set(token);
    this.hydrateUserFromToken(token);
    try {
      sessionStorage.setItem(STORAGE_KEY, token);
    } catch { /* ignore */ }
  }

  private loadFromStorage(): void {
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);
      if (token) {
        this._token.set(token);
        this.hydrateUserFromToken(token);
        // Fetch fresh profile from DB in background
        this.fetchMe();
      }
    } catch { /* ignore */ }
  }

  private hydrateUserFromToken(token: string): void {
    const payload = parseJwtPayload(token);
    if (!payload) return;

    this._currentUser.set({
      id: payload['oid'] || payload['sub'] || '',
      name: payload['name'] || '',
      email: payload['email'] || payload['emails']?.[0] || '',
      role: (payload['extension_perfil'] || 'asesor_comercial') as UserRole,
      initials: buildInitials(payload['name'] || ''),
      empresas: [],
    });
  }
}
