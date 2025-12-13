import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClient, CarDto, CreateCarRequest, GenericResponse } from '../../api/src/api/api-client';

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

  async create(car: CreateCarRequest): Promise<CarDto> {
    return await firstValueFrom(this.apiClient.postCars(car.supplierId, car.purchaseDate, car.brand, car.model, car.manufactureYear, car.purchasePrice, car.vehicleRegistrationCertificate, car.images));
  }
  async delete(id: number): Promise<GenericResponse> {
    return await firstValueFrom(this.apiClient.deleteCarsCarId(id));
  }
}
