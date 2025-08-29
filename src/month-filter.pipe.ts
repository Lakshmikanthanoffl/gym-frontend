
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthFilter'
})
export class MonthFilterPipe implements PipeTransform {
  transform(attendance: string[], month: number, year: number): string[] {
    if (!attendance) return [];
    return attendance.filter(dateStr => {
      const date = new Date(dateStr);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  }
}
