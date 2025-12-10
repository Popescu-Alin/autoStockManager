import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient, CarPartDto } from '../../api/src/api/api-client';

export interface CarPart {
  id: string;
  car: string;
  carName?: string;
  price: number;
  name: string;
  status: 'available' | 'sold';
  buyer?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class CarPartsService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<CarPartDto[]> {
     return await firstValueFrom(this.apiClient.getParts());
  }

  async getById(id: string): Promise<CarPartDto | null> {
    throw new Error('Create car part endpoint not available in API client');

  }

  async getByCarId(carId: number): Promise<CarPartDto[]> {
    return await firstValueFrom(this.apiClient.getCarsCarIdParts(carId));

  }

  create(carPart: Omit<CarPart, 'id'>): Promise<CarPart> {
    // TODO: Implement when API endpoint is available
    throw new Error('Create car part endpoint not available in API client');
  }

  update(id: string, carPart: Partial<CarPart>): Promise<CarPart> {
    // TODO: Implement when API endpoint is available
    throw new Error('Update car part endpoint not available in API client');
  }

  delete(id: string): Promise<boolean> {
    // TODO: Implement when API endpoint is available
    throw new Error('Delete car part endpoint not available in API client');
  }

}
