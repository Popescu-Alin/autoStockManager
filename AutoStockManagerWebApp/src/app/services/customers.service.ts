import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  constructor(private http: HttpClient) {}

  getAll(): Promise<Customer[]> {
    return Promise.resolve([]);
  }

  getById(id: string): Promise<Customer | null> {
    return Promise.resolve(null);
  }

  create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    return Promise.resolve({ id: '1', ...customer });
  }

  update(id: string, customer: Partial<Customer>): Promise<Customer> {
    return Promise.resolve({ id, ...customer } as Customer);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

