import { Injectable, signal } from '@angular/core';

export type UserRole = 'administrador' | 'asesor_comercial' | 'supervisor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Mock user — replace with MSAL Azure AD B2C
  private readonly _currentUser = signal<AuthUser | null>({
    id: 'u1',
    name: 'Juan Pérez',
    email: 'juan.perez@grupokaufmann.com',
    role: 'administrador',
    initials: 'JP',
  });

  currentUser = this._currentUser.asReadonly();
  isAuthenticated = () => this._currentUser() !== null;
  isAdmin = () => this._currentUser()?.role === 'administrador';

  login(user: AuthUser) {
    this._currentUser.set(user);
  }

  logout() {
    this._currentUser.set(null);
  }
}
