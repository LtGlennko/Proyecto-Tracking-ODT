import { Component, input } from '@angular/core';

import { LineaNegocio } from '@kaufmann/shared/models';

@Component({
    selector: 'kf-vehicle-icon',
    imports: [],
    template: `
    <span [class]="sizeClass()" [attr.title]="lineaNegocio()">
      @switch (iconKey()) {
        <!-- Camión / VC -->
        @case ('truck') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 3h15v13H1z"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        }
        <!-- Bus -->
        @case ('bus') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M2 9h20"/>
            <circle cx="7" cy="20" r="1.5"/>
            <circle cx="17" cy="20" r="1.5"/>
            <path d="M7 17v3M17 17v3"/>
          </svg>
        }
        <!-- Auto -->
        @case ('car') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h2l2-4h8l2 4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        }
        <!-- Maquinaria -->
        @case ('construction') {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="12" width="20" height="8" rx="1"/>
            <path d="M6 12V8M10 12V6M14 12V8M18 12V10"/>
            <circle cx="6" cy="20" r="2"/>
            <circle cx="18" cy="20" r="2"/>
          </svg>
        }
        <!-- Default -->
        @default {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        }
      }
    </span>
    `
})
export class VehicleIconComponent {
  lineaNegocio = input<LineaNegocio | string>('VC');
  size = input<'sm' | 'md' | 'lg'>('md');

  iconKey = () => {
    const l = this.lineaNegocio()?.toLowerCase() ?? '';
    if (l.includes('bus')) return 'bus';
    if (l.includes('maq')) return 'construction';
    if (l === 'autos') return 'car';
    return 'truck';
  };

  sizeClass = () => {
    switch (this.size()) {
      case 'sm': return 'inline-block w-4 h-4';
      case 'lg': return 'inline-block w-8 h-8';
      default:   return 'inline-block w-5 h-5';
    }
  };
}
