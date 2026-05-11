import { DocumentMaskPipe } from './document-mask.pipe';

describe('DocumentMaskPipe', () => {
  const pipe = new DocumentMaskPipe();

  it('should format CPF correctly', () => {
    expect(pipe.transform('12345678909', 'CPF')).toBe('123.456.789-09');
  });

  it('should format CNPJ correctly', () => {
    expect(pipe.transform('12345678000199', 'CNPJ')).toBe('12.345.678/0001-99');
  });

  it('should return empty string for empty value', () => {
    expect(pipe.transform('', 'CPF')).toBe('');
  });

  it('should strip non-digits before formatting', () => {
    expect(pipe.transform('123.456.789-09', 'CPF')).toBe('123.456.789-09');
  });
});
