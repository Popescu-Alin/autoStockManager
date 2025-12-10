import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient, CarDto } from '../../api/src/api/api-client';

export interface Car {
  id: string;
  supplier: string;
  supplierName?: string;
  purchaseDate: Date;
  brand: string;
  model: string;
  manufactureYear: number;
  price: number;
  registrationCertificate?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class CarsService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<CarDto[]> {
      return await firstValueFrom(this.apiClient.getCars());    
  }

  async getById(id: number): Promise<CarDto | undefined> {
    return await firstValueFrom(this.apiClient.getCarsCarId(id));
  }

}
