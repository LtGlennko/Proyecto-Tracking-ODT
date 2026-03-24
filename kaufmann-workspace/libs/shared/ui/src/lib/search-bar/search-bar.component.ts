import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'kf-search-bar',
  standalone: true,
  template: `
    <div class="relative" [class]="containerClass()">
      <input
        type="text"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($any($event.target).value)"
        class="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
      />
      <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </span>
      @if (value()) {
        <button
          (click)="onClear()"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors"
          aria-label="Limpiar búsqueda">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      }
    </div>
  `,
})
export class SearchBarComponent {
  placeholder = input('Buscar...');
  value = input('');
  containerClass = input('');
  valueChange = output<string>();
  cleared = output<void>();

  onInput(val: string) {
    this.valueChange.emit(val);
  }

  onClear() {
    this.valueChange.emit('');
    this.cleared.emit();
  }
}
