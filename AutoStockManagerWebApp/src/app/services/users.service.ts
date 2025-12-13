import { Injectable } from '@angular/core';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';
import { ApiClient, GenericResponse, User } from '../../api/src/api/api-client';


@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<User[]> {
    return await firstValueFrom(this.apiClient.getUsers());
  }

  async getById(id: string): Promise<User> {
    return await firstValueFrom(this.apiClient.getUsersUserId(parseInt(id, 10)));
  }

  async create(user: User): Promise<User | null> {
    return await firstValueFrom(this.apiClient.postUser(user).pipe(defaultIfEmpty(null)));
  }

  async update(id: string, user: User): Promise<User> {
    return await firstValueFrom(this.apiClient.patchUsersUserId(user, parseInt(id, 10)));
  }

  async delete(id: number): Promise<GenericResponse> {
    return await firstValueFrom(
      this.apiClient.deleteUsersUserId(id).pipe(
        defaultIfEmpty(new GenericResponse({ success: true }))
      )
    );
  }


}
