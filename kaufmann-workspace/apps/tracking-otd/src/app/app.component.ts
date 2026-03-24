import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, EmpresaFilterService } from '@kaufmann/shared/auth';

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

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  profileMenuOpen = signal(false);
  currentUser = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;
  showShell = computed(() => this.auth.isAuthenticated());

  navItems: NavItem[] = [
    { label: 'Tracking OTD', route: '/tracking',  icon: '🚛' },
    { label: 'Reporte Maestro', route: '/reporte', icon: '📋' },
    //{ label: 'Alertas',      route: '/alertas',   icon: '🔔' },
    //{ label: 'Chat',         route: '/chat',      icon: '💬' },
    //{ label: 'Analytics',    route: '/analytics', icon: '📈' },
    { label: 'Configuración',        route: '/admin',     icon: '⚙️', adminOnly: true },
    //{ label: 'Staging',      route: '/staging',   icon: '⬆️', adminOnly: true },
  ];

  visibleNavItems = computed(() =>
    this.navItems.filter(item => !item.adminOnly || this.isAdmin())
  );

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
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
