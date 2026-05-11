import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../../../core/services/client.service';

function cpfValidator(control: AbstractControl) {
  const val = control.value?.replace(/\D/g, '');
  if (!val || val.length !== 11) return { invalidCpf: true };
  if (/^(\d)\1+$/.test(val)) return { invalidCpf: true };
  const calc = (n: number) => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += +val[i] * (n + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 || r === 11 ? 0 : r;
  };
  if (calc(9) !== +val[9] || calc(10) !== +val[10]) return { invalidCpf: true };
  return null;
}

function cnpjValidator(control: AbstractControl) {
  const val = control.value?.replace(/\D/g, '');
  if (!val || val.length !== 14) return { invalidCnpj: true };
  if (/^(\d)\1+$/.test(val)) return { invalidCnpj: true };
  const calc = (weights: number[]) => {
    let sum = 0;
    weights.forEach((w, i) => (sum += +val[i] * w));
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  if (calc(w1) !== +val[12] || calc(w2) !== +val[13]) return { invalidCnpj: true };
  return null;
}

@Component({
  selector: 'app-client-form-page',
  templateUrl: './client-form-page.component.html',
  styleUrls: ['./client-form-page.component.scss']
})
export class ClientFormPageComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  saving = false;
  isEdit = false;
  clientId: string | null = null;

  documentTypes = [
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' }
  ];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.clientId;

    if (this.isEdit && this.clientId) {
      this.loading = true;
      this.clientService.getById(this.clientId).subscribe({
        next: client => {
          this.form.patchValue(client);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Cliente não encontrado.', 'OK', { duration: 3000 });
          this.router.navigate(['/clients']);
        }
      });
    }

    // When documentType changes, re-run document validators
    this.form.get('documentType')?.valueChanges.subscribe(() => {
      this.form.get('document')?.updateValueAndValidity();
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
      documentType: ['CPF', Validators.required],
      document: ['', [Validators.required, this.documentValidator.bind(this)]]
    });
  }

  documentValidator(control: AbstractControl) {
    const type = this.form?.get('documentType')?.value;
    if (type === 'CNPJ') return cnpjValidator(control);
    return cpfValidator(control);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving = true;
    const value = this.form.value;

    const request$ = this.isEdit && this.clientId
      ? this.clientService.update(this.clientId, value)
      : this.clientService.create(value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Cliente atualizado!' : 'Cliente cadastrado!',
          'OK',
          { duration: 3000 }
        );
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erro ao salvar cliente.', 'OK', { duration: 3000 });
      },
      complete: () => (this.saving = false)
    });
  }

  cancel(): void { this.router.navigate(['/clients']); }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors || !c.touched) return '';
    if (c.errors['required']) return 'Campo obrigatório';
    if (c.errors['email']) return 'E-mail inválido';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c.errors['pattern']) return 'Formato inválido';
    if (c.errors['invalidCpf']) return 'CPF inválido';
    if (c.errors['invalidCnpj']) return 'CNPJ inválido';
    return '';
  }

  get docPlaceholder(): string {
    return this.form.get('documentType')?.value === 'CNPJ'
      ? '00.000.000/0001-00'
      : '000.000.000-00';
  }
}
