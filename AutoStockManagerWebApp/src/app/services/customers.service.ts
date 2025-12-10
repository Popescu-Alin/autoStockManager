import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/src/api/api-client';

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
  // constructor(private apiClient: ApiClient) {}
  constructor() {}

  getAll(): Promise<Customer[]> {
    // TODO: Implement when API endpoint is available
    // Note: The API client has a Client interface but no endpoints for clients/customers
    return Promise.resolve([]);
  }

  getById(id: string): Promise<Customer | null> {
    // TODO: Implement when API endpoint is available
    return Promise.resolve(null);
  }

  create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    // TODO: Implement when API endpoint is available
    throw new Error('Create customer endpoint not available in API client');
  }

  update(id: string, customer: Partial<Customer>): Promise<Customer> {
    // TODO: Implement when API endpoint is available
    throw new Error('Update customer endpoint not available in API client');
  }

  delete(id: string): Promise<boolean> {
    // TODO: Implement when API endpoint is available
    throw new Error('Delete customer endpoint not available in API client');
  }
}
