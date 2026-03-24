import { Routes } from '@angular/router';
import { authGuard, adminGuard } from '@kaufmann/shared/auth';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/microsoft/callback',
    loadComponent: () =>
      import('./features/auth-callback/auth-callback.component').then(
        m => m.AuthCallbackComponent
      ),
  },
  {
    path: 'tracking',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-vin-tracking')
        .then(m => m.TRACKING_ROUTES),
  },
{
    path: 'alertas',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-alertas')
        .then(m => m.ALERTAS_ROUTES),
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-analytics')
        .then(m => m.ANALYTICS_ROUTES),
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-chat')
        .then(m => m.CHAT_ROUTES),
  },
  {
    path: 'staging',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-staging')
        .then(m => m.STAGING_ROUTES),
  },
  {
    path: 'reporte',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-reporte')
        .then(m => m.REPORTE_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-admin')
        .then(m => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '/login' },
];
