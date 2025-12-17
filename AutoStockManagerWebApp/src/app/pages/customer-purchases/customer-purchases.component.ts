import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CarPartDto, Customer } from '../../../api/src/api/api-client';
import { AuthService } from '../../services/auth.service';
import { CarPartsService } from '../../services/car-parts.service';
import { CustomersService } from '../../services/customers.service';
import { SnackbarService } from '../../services/snakbar.service';

export interface PurchasedPartTableData {
  id: number;
  name: string;
  price: number;
  purchaseDate: Date | null;
  carId: number;
}

@Component({
  selector: 'app-customer-purchases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
  ],
  templateUrl: './customer-purchases.component.html',
  styleUrl: './customer-purchases.component.css',
})
export class CustomerPurchasesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'price', 'purchaseDate'];
  dataSource = new MatTableDataSource<PurchasedPartTableData>();
  searchValue: string = '';
  isLoading = false;
  customerId: string | null = null;
  customer: Customer | null = null;
  totalSpent: number = 0;
  isAdmin = false;

  protected allParts: PurchasedPartTableData[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService,
    private carPartsService: CarPartsService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.checkAdminStatus();
    this.customerId = this.route.snapshot.paramMap.get('id');

    if (!this.customerId) {
      this.router.navigate(['/customers']);
      return;
    }

    await this.loadCustomerAndParts();
  }

  private checkAdminStatus(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 0;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: PurchasedPartTableData, filter: string): boolean => {
    const searchTerm = filter.toLowerCase();
    return data.name.toLowerCase().includes(searchTerm);
  };

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async loadCustomerAndParts() {
    this.isLoading = true;
    try {
      const customerIdNum = parseInt(this.customerId!, 10);
      
      const [customer, parts] = await Promise.all([
        this.customersService.getById(customerIdNum),
        this.carPartsService.getByCustomerId(customerIdNum),
      ]);

      this.customer = customer;

      this.allParts = parts.map((part) => ({
        id: part.carPart?.id || 0,
        name: part.carPart?.name || '',
        price: part.carPart?.price || 0,
        purchaseDate: part.carPart?.purchaseDate ? new Date(part.carPart.purchaseDate) : null,
        carId: part.carPart?.carId || 0,
      }));

      this.dataSource.data = this.allParts;
      this.calculateTotal();
    } catch (error: any) {
      console.error('Error loading customer purchases:', error);
      const errorMessage = error?.message || error?.statusText || 'Failed to load customer purchases';
      const status = error?.status;

      if (status === 404) {
        this.snackbarService.error('Customer not found or no purchases found.');
      } else if (status === 500) {
        this.snackbarService.error('Server error. Please check the backend logs and try again.');
      } else {
        this.snackbarService.error(
          `Error loading customer purchases: ${errorMessage} (Status: ${status || 'Unknown'})`
        );
      }

      this.allParts = [];
      this.dataSource.data = [];
      this.calculateTotal();
    } finally {
      this.isLoading = false;
    }
  }

  calculateTotal() {
    this.totalSpent = this.allParts.reduce((sum, part) => sum + part.price, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(amount);
  }

  formatDate(date: Date | null): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  }

  navigateToCar(carId: number) {
    if (carId && this.isAdmin) {
      this.router.navigate(['/cars', carId]);
    }
  }
}

