export * from './lib/staging-page.component';

import { Routes } from '@angular/router';
import { StagingPageComponent } from './lib/staging-page.component';

export const STAGING_ROUTES: Routes = [
  { path: '', component: StagingPageComponent },
];
