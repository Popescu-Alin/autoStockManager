import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, defaultIfEmpty, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    return router.createUrlTree(['/auth/login']);
  }

  return authService.checkAuth().pipe(
    defaultIfEmpty(true),
    map(() => {
      return true;
    }),
    catchError(() => {
      console.log('token is invalid');
      authService.removeToken();
      authService.removeCurrentUser();
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
