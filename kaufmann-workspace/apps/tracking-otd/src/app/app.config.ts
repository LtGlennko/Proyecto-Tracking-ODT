import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor, API_BASE_URL } from '@kaufmann/shared/auth';
import { environment } from '../environments/environment';
import { LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';
import {
  // Transporte
  Truck, BusFront, Car, HardHat, Container, Ship, Plane, Forklift, Anchor, Navigation, MapPin, Route, Warehouse, Factory,
  // Finanzas / Documentos
  CreditCard, Banknote, Wallet, Receipt, FileText, FileBadge, FileCheck, Folder, Clipboard, ClipboardCheck, Stamp,
  // Personas
  UserCheck, User, Users, Handshake, Contact,
  // Tiempo
  CalendarCheck, Calendar, Clock, Timer, AlarmClock,
  // Herramientas
  Wrench, Cog, Settings, Hammer, Gauge, Scan,
  // Estado
  Shield, ShieldCheck, CircleCheck, TriangleAlert, Flag, Star, Award, Trophy, Crown,
  // Objetos
  Package, Box, Tag, Key, Lock, Eye, Search, Layers, Hash, Circle, Zap, Target,
  // UI
  ArrowLeft, Workflow, GanttChart, ChevronDown, ChevronUp,
} from 'lucide-angular';

const icons = {
  Truck, BusFront, Car, HardHat, Container, Ship, Plane, Forklift, Anchor, Navigation, MapPin, Route, Warehouse, Factory,
  CreditCard, Banknote, Wallet, Receipt, FileText, FileBadge, FileCheck, Folder, Clipboard, ClipboardCheck, Stamp,
  UserCheck, User, Users, Handshake, Contact,
  CalendarCheck, Calendar, Clock, Timer, AlarmClock,
  Wrench, Cog, Settings, Hammer, Gauge, Scan,
  Shield, ShieldCheck, CircleCheck, TriangleAlert, Flag, Star, Award, Trophy, Crown,
  Package, Box, Tag, Key, Lock, Eye, Search, Layers, Hash, Circle, Zap, Target,
  ArrowLeft, Workflow, GanttChart, ChevronDown, ChevronUp,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons) },
  ],
};
