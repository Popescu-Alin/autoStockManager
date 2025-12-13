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
import { Supplier } from '../../../api/src/api/api-client';
import {
  SupplierDialogComponent,
  SupplierFormData,
} from '../../components/supplier-dialog/supplier-dialog.component';
import { SnackbarService } from '../../services/snakbar.service';
import { SuppliersService } from '../../services/suppliers.service';

export interface SupplierTableData {
  id: number;
  name: string;
  phone: string;
  ssn: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-suppliers',
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
    SupplierDialogComponent,
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css',
})
export class SuppliersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'phone', 'actions'];
  dataSource = new MatTableDataSource<SupplierTableData>();
  searchValue: string = '';
  supplierDialogVisible = false;
  supplierDialogLoading = false;
  editMode = false;
  selectedSupplier: SupplierTableData | null = null;
  isLoading = false;

  private suppliers: SupplierTableData[] = [];

  constructor(
    private suppliersService: SuppliersService,
    private snackbarService: SnackbarService
  ) {}

  async ngOnInit() {
    await this.loadSuppliers();
  }

  async loadSuppliers() {
    this.isLoading = true;
    try {
      const suppliers = await this.suppliersService.getAll();
      this.suppliers = suppliers.map((supplier) => this.mapSupplierToTableData(supplier));
      this.dataSource.data = this.suppliers;
    } catch (error) {
      console.error('Error loading suppliers:', error);
      this.snackbarService.genericError();
    } finally {
      this.isLoading = false;
    }
  }

  private mapSupplierToTableData(supplier: Supplier): SupplierTableData {
    return {
      id: supplier.id || 0,
      name: supplier.name || '',
      phone: supplier.phone || supplier.phoneNumber || '',
      ssn: supplier.ssn || '',
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: SupplierTableData, filter: string): boolean => {
    const searchTerm = filter.toLowerCase();
    return (
      data.name.toLowerCase().includes(searchTerm) ||
      data.phone.toLowerCase().includes(searchTerm) ||
      data.ssn.toLowerCase().includes(searchTerm)
    );
  };

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddSupplierDialog() {
    this.editMode = false;
    this.selectedSupplier = null;
    this.supplierDialogVisible = true;
  }

  openEditSupplierDialog(supplier: SupplierTableData) {
    this.editMode = true;
    this.selectedSupplier = supplier;
    this.supplierDialogVisible = true;
  }

  async onSupplierSubmit(supplierData: SupplierFormData) {
    this.supplierDialogLoading = true;
    try {
      if (this.editMode && this.selectedSupplier) {
        // Update existing supplier
        await this.suppliersService.update(this.selectedSupplier.id, {
          name: supplierData.name,
          phone: supplierData.phone,
          ssn: supplierData.ssn,
        });
      } else {
        await this.suppliersService.create(
          new Supplier({
            name: supplierData.name,
            phone: supplierData.phone,
            ssn: supplierData.ssn,
          })
        );
      }
      await this.loadSuppliers();
      this.supplierDialogVisible = false;
      this.supplierDialogLoading = false;
      const wasEditMode = this.editMode;
      this.editMode = false;
      this.selectedSupplier = null;
      if (wasEditMode) {
        this.snackbarService.successUpdate('Supplier');
      } else {
        this.snackbarService.successCreate('Supplier');
      }
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      this.supplierDialogLoading = false;
      if (error?.status === 409 || error?.message?.includes('Email Already Taken')) {
        this.snackbarService.emailAlreadyTaken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  async deleteSupplier(supplier: SupplierTableData) {
    if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      try {
        const response = await this.suppliersService.delete(supplier.id);
        if (response.success) {
          await this.loadSuppliers();
          this.snackbarService.successDelete('Supplier');
        } else {
          this.snackbarService.genericError();
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        this.snackbarService.genericError();
      }
    }
  }
}
