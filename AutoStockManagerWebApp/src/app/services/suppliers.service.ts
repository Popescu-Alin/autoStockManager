import { Injectable } from '@angular/core';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';
import {
  ApiClient,
  CreateSupplierRequest,
  GenericResponse,
  Supplier,
  UpdateSupplierRequest,
} from '../../api/src/api/api-client';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<Supplier[]> {
    return await firstValueFrom(this.apiClient.getSuppliers());
  }

  async getById(id: string): Promise<Supplier> {
    return await firstValueFrom(this.apiClient.getSuppliersSupplierId(parseInt(id, 10)));
  }

  async create(supplier: Omit<Supplier, 'id' | 'phoneNumber'>): Promise<Supplier | null> {
    const request = new CreateSupplierRequest({
      name: supplier.name!,
      phone: supplier.phone!,
      ssn: supplier.ssn!,
      email: supplier.email,
    });
    return await firstValueFrom(this.apiClient.postSuppliers(request).pipe(defaultIfEmpty(null)));
  }

  async update(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    const request = new UpdateSupplierRequest({
      name: supplier.name,
      phone: supplier.phone,
      ssn: supplier.ssn,
      email: supplier.email,
    });
    return await firstValueFrom(this.apiClient.patchSuppliersSupplierId(request, id));
  }

  async delete(id: number): Promise<GenericResponse> {
    return await firstValueFrom(
      this.apiClient
        .deleteSuppliersSupplierId(id)
        .pipe(defaultIfEmpty(new GenericResponse({ success: true })))
    );
  }
}
