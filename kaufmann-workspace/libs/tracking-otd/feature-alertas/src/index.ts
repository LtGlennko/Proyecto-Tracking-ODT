export * from './lib/alertas-page.component';

import { Routes } from '@angular/router';
import { AlertasPageComponent } from './lib/alertas-page.component';

export const ALERTAS_ROUTES: Routes = [
  { path: '', component: AlertasPageComponent },
];
