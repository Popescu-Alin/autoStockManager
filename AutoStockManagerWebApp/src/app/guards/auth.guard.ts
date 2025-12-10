import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    await authService.checkAuth();
    return true;
  } catch (error) {
    router.navigate(['/auth/login']);
    return false;
  }
};

