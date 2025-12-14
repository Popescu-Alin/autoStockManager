import { Routes } from '@angular/router';
import { ActivateAccountComponent } from './pages/activate-account/activate-account.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const authRoutes: Routes = [
  {
    path: 'enable-account/:token',
    component: ActivateAccountComponent,
    title: 'Activate Account',
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent,
    title: 'Reset Password',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
