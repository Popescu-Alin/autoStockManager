import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';


export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },
  {
    path: 'set-password',
    component: ResetPasswordComponent,
    title: 'Set Password'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
