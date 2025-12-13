import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Customer } from '../../../api/src/api/api-client';
import {
  CustomerDialogComponent,
  CustomerFormData,
} from '../../components/customer-dialog/customer-dialog.component';
import { EditCustomerDialogComponent } from '../../components/edit-customer-dialog/edit-customer-dialog.component';
import { CustomersService } from '../../services/customers.service';
import { SnackbarService } from '../../services/snakbar.service';

export interface CustomerTableData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

@Component({
  selector: 'app-customers',
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
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    ButtonModule,
    InputTextModule,
    CustomerDialogComponent,
    EditCustomerDialogComponent,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'email', 'phone', 'actions'];
  dataSource = new MatTableDataSource<CustomerTableData>();
  searchValue: string = '';
  isLoading = false;

  customerDialogVisible = false;
  customerDialogLoading = false;
  editCustomerDialogVisible = false;
  editCustomerDialogLoading = false;
  editingCustomer: CustomerTableData | null = null;

  private customers: CustomerTableData[] = [];

  constructor(
    private customersService: CustomersService,
    private snackbarService: SnackbarService
  ) {}

  async ngOnInit() {
    await this.loadCustomers();
  }

  async loadCustomers() {
    this.isLoading = true;
    try {
      const customers = await this.customersService.getAll();
      this.customers = customers.map((customer) => this.mapCustomerToTableData(customer));
      this.dataSource.data = this.customers;
    } catch (error) {
      console.error('Error loading customers:', error);
      this.snackbarService.genericError();
    } finally {
      this.isLoading = false;
    }
  }

  private mapCustomerToTableData(customer: Customer): CustomerTableData {
    return {
      id: customer.id || 0,
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address,
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: CustomerTableData, filter: string): boolean => {
    const searchTerm = filter.toLowerCase();
    return (
      data.name.toLowerCase().includes(searchTerm) ||
      data.email.toLowerCase().includes(searchTerm) ||
      data.phone.toLowerCase().includes(searchTerm) ||
      data.address?.toLowerCase().includes(searchTerm) ||
      false
    );
  };

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddCustomerDialog() {
    this.editingCustomer = null;
    this.customerDialogVisible = true;
  }

  openEditCustomerDialog(customer: CustomerTableData) {
    this.editingCustomer = customer;
    this.editCustomerDialogVisible = true;
  }

  async onCustomerSubmit(customerData: CustomerFormData) {
    this.customerDialogLoading = true;
    try {
      const customer = await this.customersService.create(new Customer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
      }));
      this.snackbarService.successCreate('Customer');
      this.customerDialogVisible = false;
      this.customerDialogLoading = false;
      await this.loadCustomers();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      this.customerDialogLoading = false;
      if (error.status === 409) {
        this.snackbarService.emailAlreadyTaken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  async onEditCustomerSubmit(customerData: CustomerFormData) {
    if (!this.editingCustomer) return;

    this.editCustomerDialogLoading = true;
    try {
      await this.customersService.update(this.editingCustomer.id, {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
      });
      this.snackbarService.successUpdate('Customer');
      this.editCustomerDialogVisible = false;
      this.editCustomerDialogLoading = false;
      this.editingCustomer = null;
      await this.loadCustomers();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      this.editCustomerDialogLoading = false;
      if (error.status === 409) {
        this.snackbarService.emailAlreadyTaken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  get editingCustomerData(): CustomerFormData | null {
    if (!this.editingCustomer) return null;
    return {
      name: this.editingCustomer.name,
      email: this.editingCustomer.email,
      phone: this.editingCustomer.phone,
      address: this.editingCustomer.address,
    };
  }

  async deleteCustomer(customer: CustomerTableData) {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        const response = await this.customersService.delete(customer.id);
        if (response.success) {
          await this.loadCustomers();
          this.snackbarService.successDelete('Customer');
        } else {
          this.snackbarService.genericError();
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        this.snackbarService.genericError();
      }
    }
  }
}
