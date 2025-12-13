import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ApiClient,
  CreateCustomerRequest,
  Customer,
  GenericResponse,
  UpdateCustomerRequest,
} from '../../api/src/api/api-client';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<Customer[]> {
    return await firstValueFrom(this.apiClient.getCustomers());
  }

  async getById(id: number): Promise<Customer> {
    return await firstValueFrom(this.apiClient.getCustomersCustomerId(id));
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const request = new CreateCustomerRequest({
      name: customer.name!,
      email: customer.email!,
      phone: customer.phone!,
      address: customer.address,
    });
    return await firstValueFrom(this.apiClient.postCustomers(request));
  }

  async update(id: number, customer: Partial<Customer>): Promise<Customer> {
    const request = new UpdateCustomerRequest({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    return await firstValueFrom(this.apiClient.patchCustomersCustomerId(request, id));
  }

  async delete(id: number): Promise<GenericResponse> {
    return await firstValueFrom(this.apiClient.deleteCustomersCustomerId(id));
  }
}
