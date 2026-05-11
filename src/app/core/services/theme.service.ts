import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'cm_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme$ = new BehaviorSubject<Theme>(this.detectInitialTheme());
  theme$: Observable<Theme> = this._theme$.asObservable();

  constructor() {
    this.apply(this._theme$.value);
  }

  get current(): Theme {
    return this._theme$.value;
  }

  set(theme: Theme): void {
    this._theme$.next(theme);
    this.apply(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  toggle(): void {
    this.set(this._theme$.value === 'dark' ? 'light' : 'dark');
  }

  private detectInitialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;

    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
