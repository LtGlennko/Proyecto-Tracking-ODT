import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tracking', pathMatch: 'full' },
  {
    path: 'tracking',
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-vin-tracking')
        .then(m => m.TRACKING_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-dashboard')
        .then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'alertas',
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-alertas')
        .then(m => m.ALERTAS_ROUTES),
  },
  {
    path: 'analytics',
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-analytics')
        .then(m => m.ANALYTICS_ROUTES),
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-chat')
        .then(m => m.CHAT_ROUTES),
  },
  {
    path: 'staging',
    // canActivate: [adminGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-staging')
        .then(m => m.STAGING_ROUTES),
  },
  {
    path: 'admin',
    // canActivate: [adminGuard],
    loadChildren: () =>
      import('@kaufmann/tracking-otd/feature-admin')
        .then(m => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '/tracking' },
];
