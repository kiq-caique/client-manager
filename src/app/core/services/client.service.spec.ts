import { TestBed } from '@angular/core/testing';
import { ClientService } from './client.service';
import { ClientForm } from '../models/client.model';

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load seed data initially', (done) => {
    service.getAll().subscribe(clients => {
      expect(clients.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should create a new client', (done) => {
    const form: ClientForm = {
      name: 'Test User',
      email: 'test@test.com',
      phone: '(11) 91234-5678',
      document: '12345678901',
      documentType: 'CPF'
    };

    service.create(form).subscribe(created => {
      expect(created.id).toBeTruthy();
      expect(created.name).toBe('Test User');
      expect(created.createdAt).toBeTruthy();
      done();
    });
  });

  it('should update an existing client', (done) => {
    service.getAll().subscribe(clients => {
      const target = clients[0];
      service.update(target.id, { ...target, name: 'Updated Name' }).subscribe(updated => {
        expect(updated.name).toBe('Updated Name');
        expect(updated.updatedAt).not.toBe(target.updatedAt);
        done();
      });
    });
  });

  it('should delete a client', (done) => {
    service.getAll().subscribe(initial => {
      const target = initial[0];
      service.delete(target.id).subscribe(() => {
        service.getAll().subscribe(after => {
          expect(after.find(c => c.id === target.id)).toBeUndefined();
          done();
        });
      });
    });
  });

  it('should search clients by name', (done) => {
    service.search('Ana').subscribe(result => {
      expect(result.every(c => c.name.toLowerCase().includes('ana'))).toBeTrue();
      done();
    });
  });

  it('should return error for non-existent client', (done) => {
    service.getById('invalid-id-xxx').subscribe({
      error: (err: Error) => {
        expect(err.message).toBe('Cliente não encontrado');
        done();
      }
    });
  });
});
