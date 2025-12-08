import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  constructor(private http: HttpClient) {}

  getAll(): Promise<Car[]> {
    return Promise.resolve([]);
  }

  getById(id: string): Promise<Car | null> {
    return Promise.resolve(null);
  }

  create(car: Omit<Car, 'id'>): Promise<Car> {
    return Promise.resolve({ id: '1', ...car });
  }

  update(id: string, car: Partial<Car>): Promise<Car> {
    return Promise.resolve({ id, ...car } as Car);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

