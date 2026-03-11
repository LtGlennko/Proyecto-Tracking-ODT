export * from './lib/dashboard-page.component';

import { Routes } from '@angular/router';
import { DashboardPageComponent } from './lib/dashboard-page.component';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardPageComponent },
];
