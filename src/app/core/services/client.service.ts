import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Client, ClientForm } from '../models/client.model';

const STORAGE_KEY = 'cm_clients';

const SEED_DATA: Client[] = [
  {
    id: uuidv4(),
    name: 'Ana Paula Souza',
    email: 'ana.souza@email.com',
    phone: '(11) 91234-5678',
    document: '123.456.789-09',
    documentType: 'CPF',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  },
  {
    id: uuidv4(),
    name: 'Tech Solutions Ltda',
    email: 'contato@techsolutions.com.br',
    phone: '(21) 3456-7890',
    document: '12.345.678/0001-99',
    documentType: 'CNPJ',
    createdAt: new Date('2024-02-14').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString()
  },
  {
    id: uuidv4(),
    name: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@gmail.com',
    phone: '(31) 98765-4321',
    document: '987.654.321-00',
    documentType: 'CPF',
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2024-03-05').toISOString()
  },
  {
    id: uuidv4(),
    name: 'Inova Digital ME',
    email: 'inovadigital@empresa.com',
    phone: '(51) 3322-1100',
    document: '98.765.432/0001-10',
    documentType: 'CNPJ',
    createdAt: new Date('2024-04-20').toISOString(),
    updatedAt: new Date('2024-05-01').toISOString()
  },
  {
    id: uuidv4(),
    name: 'Fernanda Lima',
    email: 'fernanda.lima@hotmail.com',
    phone: '(41) 99988-7766',
    document: '456.789.123-55',
    documentType: 'CPF',
    createdAt: new Date('2024-05-12').toISOString(),
    updatedAt: new Date('2024-05-12').toISOString()
  }
];

@Injectable({ providedIn: 'root' })
export class ClientService {
  private _clients$ = new BehaviorSubject<Client[]>(this.load());

  clients$: Observable<Client[]> = this._clients$.asObservable();

  // ── Read ────────────────────────────────────────────────────
  getAll(): Observable<Client[]> {
    return this.clients$.pipe(delay(300));
  }

  getById(id: string): Observable<Client> {
    const client = this._clients$.value.find(c => c.id === id);
    if (!client) return throwError(() => new Error('Cliente não encontrado'));
    return of({ ...client }).pipe(delay(200));
  }

  // ── Create ──────────────────────────────────────────────────
  create(form: ClientForm): Observable<Client> {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...form,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newClient, ...this._clients$.value];
    return of(newClient).pipe(
      delay(500),
      tap(() => this.persist(updated))
    );
  }

  // ── Update ──────────────────────────────────────────────────
  update(id: string, form: ClientForm): Observable<Client> {
    const existing = this._clients$.value.find(c => c.id === id);
    if (!existing) return throwError(() => new Error('Cliente não encontrado'));

    const updated: Client = {
      ...existing,
      ...form,
      updatedAt: new Date().toISOString()
    };
    const list = this._clients$.value.map(c => (c.id === id ? updated : c));
    return of(updated).pipe(
      delay(500),
      tap(() => this.persist(list))
    );
  }

  // ── Delete ──────────────────────────────────────────────────
  delete(id: string): Observable<void> {
    const list = this._clients$.value.filter(c => c.id !== id);
    return of(void 0).pipe(
      delay(300),
      tap(() => this.persist(list))
    );
  }

  // ── Search ──────────────────────────────────────────────────
  search(term: string): Observable<Client[]> {
    const t = term.toLowerCase();
    return this.clients$.pipe(
      map(clients =>
        clients.filter(
          c =>
            c.name.toLowerCase().includes(t) ||
            c.email.toLowerCase().includes(t) ||
            c.document.includes(t)
        )
      )
    );
  }

  // ── Persistence ─────────────────────────────────────────────
  private persist(clients: Client[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    this._clients$.next(clients);
  }

  private load(): Client[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    // Seed initial data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
}

// tiny uuid polyfill if needed
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
