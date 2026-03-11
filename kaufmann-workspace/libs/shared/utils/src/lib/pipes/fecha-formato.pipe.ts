import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '../helpers/date.helpers';

@Pipe({ name: 'fechaFormato', standalone: true })
export class FechaFormatoPipe implements PipeTransform {
  transform(value: string | null): string {
    return formatDate(value);
  }
}
