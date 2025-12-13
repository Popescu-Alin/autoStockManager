import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ApiClient,
  LoginResponse as ApiLoginResponse,
  AuthRequest,
  User,
} from '../../api/src/api/api-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apiClient: ApiClient, private router: Router) {}

  validateResetToken(token: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  async login(loginData: AuthRequest): Promise<ApiLoginResponse> {
    return await firstValueFrom(this.apiClient.postLogin(loginData));
  }

  checkAuth() {
    return this.apiClient.getAuthCheck();
  }

  getCurrentUser(): User | undefined {
    return localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser')!)
      : undefined;
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  removeCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | undefined {
    return localStorage.getItem('token') ?? undefined;
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }
}
