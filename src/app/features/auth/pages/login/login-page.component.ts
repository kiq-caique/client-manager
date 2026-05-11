import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['admin@clientmanager.dev', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const { email, password } = this.form.value;

    this.auth.login({ email, password }).subscribe({
      next: () => this.router.navigate(['/clients']),
      error: (err: Error) => {
        this.loading = false;
        this.snackBar.open(err.message, 'OK', { duration: 4000 });
      },
      complete: () => (this.loading = false)
    });
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors || !c.touched) return '';
    if (c.errors['required']) return 'Campo obrigatório';
    if (c.errors['email']) return 'E-mail inválido';
    if (c.errors['minlength']) return 'Mínimo 6 caracteres';
    return '';
  }
}
