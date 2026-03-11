import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@kaufmann/shared/auth';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  currentUser = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;

  navItems: NavItem[] = [
    //{ label: 'Dashboard',    route: '/dashboard', icon: '📊' },
    { label: 'Tracking OTD', route: '/tracking',  icon: '🚛' },
    //{ label: 'Alertas',      route: '/alertas',   icon: '🔔' },
    //{ label: 'Chat',         route: '/chat',      icon: '💬' },
    //{ label: 'Analytics',    route: '/analytics', icon: '📈' },
    { label: 'Configuración',        route: '/admin',     icon: '⚙️', adminOnly: true },
    { label: 'Staging',      route: '/staging',   icon: '⬆️', adminOnly: true },
  ];

  visibleNavItems = computed(() =>
    this.navItems.filter(item => !item.adminOnly || this.isAdmin())
  );

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  get currentRouteName(): string {
    const item = this.navItems.find(n => this.router.url.startsWith(n.route));
    return item?.label ?? 'Tracking OTD';
  }
}
