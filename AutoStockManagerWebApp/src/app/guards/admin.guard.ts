import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = authService.getCurrentUser()?.role === 0;

  if (!isAdmin) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
