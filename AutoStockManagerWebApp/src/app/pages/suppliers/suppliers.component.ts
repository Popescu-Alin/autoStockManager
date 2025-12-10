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
import { ImagePreviewDialogComponent } from '../../components/image-preview-dialog/image-preview-dialog.component';
import {
  SupplierDialogComponent,
  SupplierFormData,
} from '../../components/supplier-dialog/supplier-dialog.component';

export interface SupplierTableData {
  id: string;
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
    SupplierDialogComponent
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
  editMode = false;
  selectedSupplier: SupplierTableData | null = null;

  private suppliers: SupplierTableData[] = [
    {
      id: '1',
      name: 'John Doe',
      phone: '(123) 456-7890',
      ssn: '1981231123456',
      imageUrl: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Supplier+1',
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '(234) 567-8901',
      ssn: '1992342234567',
      imageUrl: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Supplier+2',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      phone: '(345) 678-9012',
      ssn: '2003453345678',
      imageUrl: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Supplier+3',
    },
    {
      id: '4',
      name: 'Alice Williams',
      phone: '(456) 789-0123',
      ssn: '2014564456789',
    },
  ];

  ngOnInit() {
    this.dataSource.data = this.suppliers;
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

  onSupplierSubmit(supplierData: SupplierFormData) {
    if (this.editMode && this.selectedSupplier) {
      // Update existing supplier
      const index = this.suppliers.findIndex((s) => s.id === this.selectedSupplier!.id);
      if (index !== -1) {
        this.suppliers[index] = {
          ...this.suppliers[index],
          name: supplierData.name,
          phone: supplierData.phone,
          ssn: supplierData.ssn,
        };
        this.dataSource.data = [...this.suppliers];
      }
    } else {
      // Add new supplier
      const newSupplier: SupplierTableData = {
        id: String(this.suppliers.length + 1),
        name: supplierData.name,
        phone: supplierData.phone,
        ssn: supplierData.ssn,
      };
      this.suppliers.push(newSupplier);
      this.dataSource.data = [...this.suppliers];
    }
    this.supplierDialogVisible = false;
    this.editMode = false;
    this.selectedSupplier = null;
  }

  deleteSupplier(supplier: SupplierTableData) {
    if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      this.suppliers = this.suppliers.filter((s) => s.id !== supplier.id);
      this.dataSource.data = [...this.suppliers];
    }
  }
}
