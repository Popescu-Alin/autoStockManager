import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth.routes';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { CarsComponent } from './pages/cars/cars.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { HomeComponent } from './pages/home/home.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
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
        path: 'cars',
        component: CarsComponent,
        title: 'Cars'
      },
      {
        path: 'users',
        component: UsersComponent,
        title: 'Users',
        // canActivate: [AdminGuard]
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