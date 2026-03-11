export * from './lib/chat-page.component';

import { Routes } from '@angular/router';
import { ChatPageComponent } from './lib/chat-page.component';

export const CHAT_ROUTES: Routes = [
  { path: '', component: ChatPageComponent },
];
