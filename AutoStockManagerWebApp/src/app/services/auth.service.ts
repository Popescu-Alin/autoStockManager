import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface PasswordResetRequest {
  token: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: CurrentUser;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CheckAuthResponse {
  isAuthenticated: boolean;
  user?: CurrentUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: CurrentUser | null = null;
  private token: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // Load token and user from localStorage on service initialization
    this.loadFromStorage();
  }

  validateResetToken(token: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  setPassword(passwordResetData: PasswordResetRequest): Promise<boolean> {
    return Promise.resolve(true);
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // Dummy implementation - replace with actual API call
    const response: LoginResponse = {
      token: 'dummy-token',
      user: {
        id: '1',
        email: loginData.email,
        name: 'User',
        role: 'user',
      },
    };

    this.setAuthData(response.token, response.user!);
    return response;
  }

  async checkAuth(): Promise<boolean> {
    // API endpoint: GET /auth/check or similar
    const apiUrl = 'https://localhost:7242/auth/check';

    try {
      // Check if we have a token stored
      if (!this.token) {
        return false;
      }

      // Call the API to verify token
      // Uncomment when backend is ready:
      // const response = await this.http.get<CheckAuthResponse>(apiUrl, {
      //   headers: { Authorization: `Bearer ${this.token}` }
      // }).toPromise();
      //
      // if (response?.isAuthenticated && response.user) {
      //   this.currentUser = response.user;
      //   this.setAuthData(this.token, response.user);
      //   return true;
      // }
      //
      // return false;

      // Dummy implementation: return true if token exists
      // In production, replace with actual API call above
      return !!this.token;
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private setAuthData(token: string, user: CurrentUser): void {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private clearAuthData(): void {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        this.token = token;
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }
}
