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
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CarPartsService } from '../../services/car-parts.service';
import { SnackbarService } from '../../services/snakbar.service';

export interface SoldPartTableData {
  id: number;
  name: string;
  price: number;
  dateSold: Date | null;
  carId: number;
}

@Component({
  selector: 'app-statistics',
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
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'price', 'dateSold'];
  dataSource = new MatTableDataSource<SoldPartTableData>();
  searchValue: string = '';
  startDate: string = '';
  endDate: string = '';
  isLoading = false;
  totalRevenue: number = 0;

  protected allParts: SoldPartTableData[] = [];

  constructor(
    private carPartsService: CarPartsService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Set default dates (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.endDate = endDate.toISOString().split('T')[0];
    this.startDate = startDate.toISOString().split('T')[0];

    await this.loadSoldParts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: SoldPartTableData, filter: string): boolean => {
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

  async onDateRangeChange() {
    // Only load if both dates are set or neither is set
    if ((this.startDate && this.endDate) || (!this.startDate && !this.endDate)) {
      await this.loadSoldParts();
    }
  }

  async loadSoldParts() {
    this.isLoading = true;
    try {
      const startDateObj = this.startDate ? new Date(this.startDate) : undefined;
      const endDateObj = this.endDate ? new Date(this.endDate) : undefined;

      const parts = await this.carPartsService.getSoldParts(startDateObj, endDateObj);
      if (!parts) {
        this.allParts = [];
        this.dataSource.data = [];
        this.calculateTotal();
        return;
      }
      // Filter only sold parts (status === 0) and map to table data
      this.allParts = parts
        .filter((part) => part.carPart?.status === 0) // Status 0 = Sold
        .map((part) => ({
          id: part.carPart?.id || 0,
          name: part.carPart?.name || '',
          price: part.carPart?.price || 0,
          dateSold: part.carPart?.purchaseDate ? new Date(part.carPart.purchaseDate) : null,
          carId: part.carPart?.carId || 0,
        }));

      this.dataSource.data = this.allParts;
      this.calculateTotal();
    } catch (error: any) {
      console.error('Error loading sold parts:', error);
      const errorMessage = error?.message || error?.statusText || 'Failed to load sold parts';
      const status = error?.status;

      if (status === 404) {
        this.snackbarService.error(
          'Endpoint not found. The /parts/sold endpoint may not be implemented on the backend yet.'
        );
      } else if (status === 500) {
        this.snackbarService.error('Server error. Please check the backend logs and try again.');
      } else if (status === 400) {
        this.snackbarService.error('Invalid date format. Please check your date selections.');
      } else {
        this.snackbarService.error(
          `Error loading statistics: ${errorMessage} (Status: ${status || 'Unknown'})`
        );
      }

      // Reset data on error
      this.allParts = [];
      this.dataSource.data = [];
      this.calculateTotal();
    } finally {
      this.isLoading = false;
    }
  }

  calculateTotal() {
    this.totalRevenue = this.allParts.reduce((sum, part) => sum + part.price, 0);
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
    if (carId) {
      this.router.navigate(['/cars', carId]);
    }
  }
}
