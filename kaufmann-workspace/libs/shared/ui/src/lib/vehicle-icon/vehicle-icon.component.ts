import { Component, input, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'kf-vehicle-icon',
    imports: [LucideAngularModule],
    template: `
    <span [class]="sizeClass()">
      @if (icono()) {
        <lucide-icon [name]="icono()!" [size]="iconSize()" [strokeWidth]="1.5"></lucide-icon>
      } @else {
        <lucide-icon name="circle" [size]="iconSize()" [strokeWidth]="1.5"></lucide-icon>
      }
    </span>
    `
})
export class VehicleIconComponent {
  icono = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg'>('md');

  iconSize = computed(() => {
    switch (this.size()) {
      case 'sm': return 16;
      case 'lg': return 32;
      default: return 20;
    }
  });

  sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm': return 'inline-flex items-center justify-center w-4 h-4';
      case 'lg': return 'inline-flex items-center justify-center w-8 h-8';
      default: return 'inline-flex items-center justify-center w-5 h-5';
    }
  });
}
