import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor, API_BASE_URL } from '@kaufmann/shared/auth';
import { environment } from '../environments/environment';
import { LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';
import { Anchor, UserCheck, Wrench, CreditCard, FileText, Banknote, FileBadge, CalendarCheck, Truck, Circle, Package, Shield, Clock, MapPin, Star, Cog, Clipboard, Box, Eye, Hash, Tag, Layers } from 'lucide-angular';

const icons = { Anchor, UserCheck, Wrench, CreditCard, FileText, Banknote, FileBadge, CalendarCheck, Truck, Circle, Package, Shield, Clock, MapPin, Star, Cog, Clipboard, Box, Eye, Hash, Tag, Layers };

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons) },
  ],
};
