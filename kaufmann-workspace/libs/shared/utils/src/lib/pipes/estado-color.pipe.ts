import { Pipe, PipeTransform } from '@angular/core';
import { EstadoVin, EstadoHito } from '@kaufmann/shared/models';

@Pipe({ name: 'estadoColor', standalone: true })
export class EstadoColorPipe implements PipeTransform {
  transform(estado: EstadoVin | EstadoHito | string): string {
    switch (estado) {
      case 'A TIEMPO':
      case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'DEMORADO':
      case 'delayed':   return 'text-red-700 bg-red-50 border-red-200';
      case 'ENTREGADO': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'active':    return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pending':   return 'text-slate-500 bg-slate-100 border-slate-200';
      default:          return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  }
}
