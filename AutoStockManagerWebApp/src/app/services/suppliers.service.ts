import { Injectable } from '@angular/core';
// import { ApiClient } from '../../api/src/api/api-client';

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
  // constructor(private apiClient: ApiClient) {}
  constructor() {}

  getAll(): Promise<Supplier[]> {
    // TODO: Implement when API endpoint is available
    // The API client does not currently have supplier endpoints
    return Promise.resolve([]);
  }

  getById(id: string): Promise<Supplier | null> {
    // TODO: Implement when API endpoint is available
    return Promise.resolve(null);
  }

  create(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    // TODO: Implement when API endpoint is available
    throw new Error('Create supplier endpoint not available in API client');
  }

  update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    // TODO: Implement when API endpoint is available
    throw new Error('Update supplier endpoint not available in API client');
  }

  delete(id: string): Promise<boolean> {
    // TODO: Implement when API endpoint is available
    throw new Error('Delete supplier endpoint not available in API client');
  }
}
