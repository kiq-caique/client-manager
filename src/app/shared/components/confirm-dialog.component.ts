import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2 class="confirm-dialog__title">{{ data.title }}</h2>
      <p class="confirm-dialog__message">{{ data.message }}</p>
      <div class="confirm-dialog__actions">
        <button mat-button (click)="ref.close(false)">
          {{ data.cancelLabel || 'Cancelar' }}
        </button>
        <button mat-flat-button color="warn" (click)="ref.close(true)">
          {{ data.confirmLabel || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 8px 4px 4px;
      color: var(--color-text);
    }
    .confirm-dialog__title {
      font-family: var(--font-display);
      font-size: 1.1rem;
      margin-bottom: 12px;
      color: var(--color-text);
    }
    .confirm-dialog__message {
      color: var(--color-text-muted);
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .confirm-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
