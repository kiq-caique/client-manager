import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ClientService } from '../../../../core/services/client.service';
import { Client } from '../../../../core/models/client.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-client-list-page',
  templateUrl: './client-list-page.component.html',
  styleUrls: ['./client-list-page.component.scss']
})
export class ClientListPageComponent implements OnInit {
  private _paginator?: MatPaginator;
  private _sort?: MatSort;

  @ViewChild(MatPaginator)
  set matPaginator(p: MatPaginator | undefined) {
    this._paginator = p;
    if (p) this.dataSource.paginator = p;
  }
  get matPaginator(): MatPaginator | undefined { return this._paginator; }

  @ViewChild(MatSort)
  set matSort(s: MatSort | undefined) {
    this._sort = s;
    if (s) this.dataSource.sort = s;
  }
  get matSort(): MatSort | undefined { return this._sort; }

  displayedColumns = ['name', 'email', 'phone', 'document', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<Client>();
  searchControl = new FormControl('');
  loading = true;
  totalClients = 0;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource.sortingDataAccessor = (item, prop) => {
      return (item as unknown as Record<string, string>)[prop] ?? '';
    };
  }

  ngOnInit(): void {
    this.loadClients();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.dataSource.filter = (term ?? '').trim().toLowerCase();
      if (this._paginator) this._paginator.firstPage();
    });
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: clients => {
        this.dataSource.data = clients;
        this.totalClients = clients.length;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  editClient(id: string): void {
    this.router.navigate(['/clients', id, 'edit']);
  }

  deleteClient(client: Client): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Excluir cliente',
        message: `Tem certeza que deseja excluir "${client.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.clientService.delete(client.id).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso.', 'OK', { duration: 3000 });
          this.loadClients();
        },
        error: () => {
          this.snackBar.open('Erro ao excluir cliente.', 'OK', { duration: 3000 });
        }
      });
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
