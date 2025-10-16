import { Pipe, PipeTransform } from '@angular/core';
import { Student } from '../models/student.interface';

export type FullNameFormat = 'uppercase' | 'lowercase' | 'capitalize';

@Pipe({
  name: 'fullName',
  standalone: true,
  pure: true
})
export class FullNamePipe implements PipeTransform {
  transform(
    value: Pick<Student, 'firstName' | 'lastName'> | null | undefined,
    format: FullNameFormat = 'capitalize'
  ): string {
    if (!value || !value.firstName || !value.lastName) {
      return '';
    }

    const fullName = `${value.firstName} ${value.lastName}`;

    switch (format) {
      case 'uppercase':
        return fullName.toUpperCase();
      case 'lowercase':
        return fullName.toLowerCase();
      case 'capitalize':
      default:
        return this.capitalizeWords(fullName);
    }
  }

  private capitalizeWords(text: string): string {
    return text
      .split(' ')
      .map(word => {
        if (word.length === 0) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
}
