import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { UsersComponent } from './pages/users/users.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
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
      {
        path: 'users',
        component: UsersComponent,
        title: 'Users',
        canActivate: [adminGuard]
      },
      {
        path: 'suppliers',
        component: SuppliersComponent,
        title: 'Suppliers'
      },
      {
        path: 'customers',
        component: CustomersComponent,
        title: 'Customers'
      },
      {
        path: 'cars/:id',
        component: CarDetailsComponent,
        title: 'Car Details'
      },
      {
        path: '**',
        redirectTo: '/auth'
      }
    ]
  }
];