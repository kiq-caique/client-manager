import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentMaskPipe } from './pipes/document-mask.pipe';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';

const MATERIAL = [
  MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
  MatSelectModule, MatTableModule, MatPaginatorModule, MatSortModule,
  MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
  MatChipsModule, MatTooltipModule, MatMenuModule, MatCardModule, MatBadgeModule
];

@NgModule({
  declarations: [DocumentMaskPipe],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ...MATERIAL],
  exports: [
    CommonModule, RouterModule, ReactiveFormsModule, DocumentMaskPipe,
    ...MATERIAL
  ]
})
export class SharedModule {}
