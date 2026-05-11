import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(ThemeService);
    expect(service).toBeTruthy();
  });

  it('should default to dark when no preference is saved and system prefers dark', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const service = TestBed.inject(ThemeService);
    expect(service.current).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should respect saved preference over system preference', () => {
    localStorage.setItem('cm_theme', 'light');
    const service = TestBed.inject(ThemeService);
    expect(service.current).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should persist theme on set', () => {
    const service = TestBed.inject(ThemeService);
    service.set('light');
    expect(localStorage.getItem('cm_theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle between dark and light', () => {
    const service = TestBed.inject(ThemeService);
    const initial = service.current;
    service.toggle();
    expect(service.current).not.toBe(initial);
    service.toggle();
    expect(service.current).toBe(initial);
  });

  it('should emit on theme$ when changed', (done) => {
    const service = TestBed.inject(ThemeService);
    const emissions: string[] = [];
    service.theme$.subscribe(t => {
      emissions.push(t);
      if (emissions.length === 2) {
        expect(emissions[1]).not.toBe(emissions[0]);
        done();
      }
    });
    service.toggle();
  });
});
