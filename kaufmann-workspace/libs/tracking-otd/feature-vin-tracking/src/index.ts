export * from './lib/containers/tracking-list-page/tracking-list-page.component';
export * from './lib/components/tracking-drawer/tracking-drawer.component';
export * from './lib/components/visual-map/visual-map.component';
export * from './lib/components/gantt-view/gantt-view.component';

import { Routes } from '@angular/router';
import { TrackingListPageComponent } from './lib/containers/tracking-list-page/tracking-list-page.component';

export const TRACKING_ROUTES: Routes = [
  { path: '', component: TrackingListPageComponent },
];
