import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { LoginCredentials, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'cm_token';
  private readonly USER_KEY  = 'cm_user';

  private _currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this._currentUser$.asObservable();

  // Demo credentials
  private readonly DEMO_USER: User = {
    id: '1',
    name: 'Admin',
    email: 'admin@clientmanager.dev',
    token: 'mock-jwt-token-xyz-987'
  };

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: LoginCredentials): Observable<User> {
    // Simulate API call
    if (
      credentials.email === 'admin@clientmanager.dev' &&
      credentials.password === 'admin123'
    ) {
      return of(this.DEMO_USER).pipe(
        delay(800),
        tap(user => this.saveSession(user))
      );
    }
    return throwError(() => new Error('Credenciais inválidas')).pipe(delay(800));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser$.next(null);
    this.router.navigate(['/auth/login']);
  }

  private saveSession(user: User): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser$.next(user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
