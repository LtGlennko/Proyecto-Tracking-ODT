import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kf-pagination',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 kf-card">
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span class="text-xs text-slate-500">
          Página {{ page() }} de {{ totalPages() }} · {{ total() }} VINs
        </span>
        <select
          [ngModel]="pageSize()"
          (ngModelChange)="onPageSizeChange($event)"
          class="text-xs rounded border border-slate-200 bg-white px-2 py-1 text-slate-600">
          @for (opt of pageSizeOptions(); track opt) {
            <option [value]="opt">{{ opt }} por página</option>
          }
        </select>
      </div>
      <div class="flex gap-2">
        @if (page() > 1) {
          <button
            (click)="pageChange.emit(page() - 1)"
            class="px-3 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
          >← Anterior</button>
        }
        @if (page() < totalPages()) {
          <button
            (click)="pageChange.emit(page() + 1)"
            class="px-3 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
          >Siguiente →</button>
        }
      </div>
    </div>
  `,
})
export class PaginationComponent {
  page = input.required<number>();
  pageSize = input.required<number>();
  total = input.required<number>();
  pageSizeOptions = input<number[]>([50, 100, 150, 200]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages(): number {
    const ps = this.pageSize();
    const t = this.total();
    return ps > 0 ? Math.ceil(t / ps) : 1;
  }

  onPageSizeChange(value: number | string): void {
    this.pageSizeChange.emit(Number(value));
  }
}
