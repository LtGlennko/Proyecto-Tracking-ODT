import { Pipe, PipeTransform } from '@angular/core';
import { calculateDiff } from '../helpers/date.helpers';

@Pipe({ name: 'diferenciaDias', standalone: true })
export class DiferenciaDiasPipe implements PipeTransform {
  transform(date1: string | null, date2: string | null): number {
    return calculateDiff(date1, date2);
  }
}
