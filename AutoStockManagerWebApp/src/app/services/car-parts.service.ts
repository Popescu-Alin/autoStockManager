import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ApiClient,
  CarPartDto,
  GenericResponse,
  UpdateCarPartRequest,
} from '../../api/src/api/api-client';

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

  async getById(id: string): Promise<CarPartDto> {
    return await firstValueFrom(this.apiClient.getPartsPartId(parseInt(id, 10)));
  }

  async getByCarId(carId: number): Promise<CarPartDto[]> {
    return await firstValueFrom(this.apiClient.getCarsCarIdParts(carId));
  }

  async create(
    carId: number,
    price: number,
    name: string,
    status: number,
    buyer?: string,
    clientId?: number,
    images?: string[]
  ): Promise<CarPartDto> {
    return await firstValueFrom(
      this.apiClient.postParts(carId, price, name, status, images)
    );
  }

  async update(id: string, carPart: Partial<CarPart>): Promise<CarPartDto> {
    const request = new UpdateCarPartRequest({
      carId: carPart.car ? parseInt(carPart.car, 10) : undefined,
      price: carPart.price,
      name: carPart.name,
      status: carPart.status === 'available' ? 0 : carPart.status === 'sold' ? 1 : undefined,
      buyer: carPart.buyer,
      images: carPart.images,
    });
    return await firstValueFrom(this.apiClient.patchPartsPartId(request, parseInt(id, 10)));
  }

  async delete(id: number): Promise<GenericResponse> {
    return await firstValueFrom(this.apiClient.deletePartsPartId(id));
  }
}
