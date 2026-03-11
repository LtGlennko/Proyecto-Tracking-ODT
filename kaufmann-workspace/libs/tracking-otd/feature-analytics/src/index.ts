export * from './lib/analytics-page.component';

import { Routes } from '@angular/router';
import { AnalyticsPageComponent } from './lib/analytics-page.component';

export const ANALYTICS_ROUTES: Routes = [
  { path: '', component: AnalyticsPageComponent },
];
