export * from './lib/reporte-page.component';

import { Routes } from '@angular/router';
import { ReportePageComponent } from './lib/reporte-page.component';

export const REPORTE_ROUTES: Routes = [
  { path: '', component: ReportePageComponent },
];
