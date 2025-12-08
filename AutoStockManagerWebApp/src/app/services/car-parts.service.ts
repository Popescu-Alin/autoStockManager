import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  constructor(private http: HttpClient) {}

  getAll(): Promise<CarPart[]> {
    return Promise.resolve([]);
  }

  getById(id: string): Promise<CarPart | null> {
    return Promise.resolve(null);
  }

  getByCarId(carId: string): Promise<CarPart[]> {
    return Promise.resolve([]);
  }

  create(carPart: Omit<CarPart, 'id'>): Promise<CarPart> {
    return Promise.resolve({ id: '1', ...carPart });
  }

  update(id: string, carPart: Partial<CarPart>): Promise<CarPart> {
    return Promise.resolve({ id, ...carPart } as CarPart);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

