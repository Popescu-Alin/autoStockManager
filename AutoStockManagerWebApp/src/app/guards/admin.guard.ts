import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = authService.getCurrentUser()?.role == 'admin';

  if (!isAdmin) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
