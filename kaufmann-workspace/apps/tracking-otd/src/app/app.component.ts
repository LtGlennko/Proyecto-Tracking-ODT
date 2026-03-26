import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, EmpresaFilterService } from '@kaufmann/shared/auth';
import { AlertasStore } from '@kaufmann/tracking-otd/data-access';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
    templateUrl: './app.component.html'
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly empresaFilter = inject(EmpresaFilterService);
  readonly alertasStore = inject(AlertasStore);

  sidebarCollapsed = signal(true);
  mobileSidebarOpen = signal(false);
  private collapseTimer: ReturnType<typeof setTimeout> | null = null;
  private navigating = false;
  profileMenuOpen = signal(false);
  currentUser = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;
  showShell = computed(() => this.auth.isAuthenticated());

  navItems: NavItem[] = [
    { label: 'Tracking OTD', route: '/tracking',  icon: '🚛' },
    { label: 'Reporte Maestro', route: '/reporte', icon: '📋' },
    { label: 'Alertas',      route: '/alertas',   icon: '🔔' },
    //{ label: 'Chat',         route: '/chat',      icon: '💬' },
    //{ label: 'Analytics',    route: '/analytics', icon: '📈' },
    { label: 'Configuración',        route: '/admin',     icon: '⚙️', adminOnly: true },
    //{ label: 'Staging',      route: '/staging',   icon: '⬆️', adminOnly: true },
  ];

  visibleNavItems = computed(() =>
    this.navItems.filter(item => !item.adminOnly || this.isAdmin())
  );

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.navigating = true;
      if (event instanceof NavigationEnd) setTimeout(() => { this.navigating = false; }, 50);
    });
  }

  onSidebarEnter() {
    if (this.collapseTimer) { clearTimeout(this.collapseTimer); this.collapseTimer = null; }
    this.sidebarCollapsed.set(false);
  }

  onSidebarLeave() {
    if (this.navigating) return;
    this.collapseTimer = setTimeout(() => { this.sidebarCollapsed.set(true); this.collapseTimer = null; }, 150);
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update(v => !v);
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update(v => !v);
  }

  logout() {
    this.profileMenuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get currentRouteName(): string {
    const item = this.navItems.find(n => this.router.url.startsWith(n.route));
    return item?.label ?? 'Tracking OTD';
  }
}
