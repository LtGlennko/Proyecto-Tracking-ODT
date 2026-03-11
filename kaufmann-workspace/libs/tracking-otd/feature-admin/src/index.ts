export * from './lib/admin-page.component';

import { Routes } from '@angular/router';
import { AdminPageComponent } from './lib/admin-page.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminPageComponent },
];
