import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getAll(): Promise<User[]> {
    return Promise.resolve([]);
  }

  getById(id: string): Promise<User | null> {
    return Promise.resolve(null);
  }

  create(user: Omit<User, 'id'>): Promise<User> {
    return Promise.resolve({ id: '1', ...user });
  }

  update(id: string, user: Partial<User>): Promise<User> {
    return Promise.resolve({ id, ...user } as User);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

