import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  ssn: string;
  email?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  constructor(private http: HttpClient) {}

  getAll(): Promise<Supplier[]> {
    return Promise.resolve([]);
  }

  getById(id: string): Promise<Supplier | null> {
    return Promise.resolve(null);
  }

  create(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    return Promise.resolve({ id: '1', ...supplier });
  }

  update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    return Promise.resolve({ id, ...supplier } as Supplier);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

