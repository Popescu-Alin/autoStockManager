import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'Home'
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Home'
      },
      // Add your non-auth routes here
      // Example:
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      //   title: 'Dashboard'
      // },
      {
        path: '**',
        redirectTo: '/auth'
      }
    ]
  }
];