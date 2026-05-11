import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn should be false initially', () => {
    expect(service.isLoggedIn).toBeFalse();
  });

  it('should login with correct credentials', (done) => {
    service.login({ email: 'admin@clientmanager.dev', password: 'admin123' }).subscribe({
      next: user => {
        expect(user.email).toBe('admin@clientmanager.dev');
        expect(service.isLoggedIn).toBeTrue();
        done();
      }
    });
  });

  it('should reject invalid credentials', (done) => {
    service.login({ email: 'wrong@email.com', password: 'wrong' }).subscribe({
      error: (err: Error) => {
        expect(err.message).toBe('Credenciais inválidas');
        done();
      }
    });
  });

  it('should clear session on logout', (done) => {
    service.login({ email: 'admin@clientmanager.dev', password: 'admin123' }).subscribe({
      next: () => {
        service.logout();
        expect(service.isLoggedIn).toBeFalse();
        expect(service.token).toBeNull();
        done();
      }
    });
  });
});
