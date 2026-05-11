import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'documentMask' })
export class DocumentMaskPipe implements PipeTransform {
  transform(value: string, type: 'CPF' | 'CNPJ'): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (type === 'CPF') {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}
