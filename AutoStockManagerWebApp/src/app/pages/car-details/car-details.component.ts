import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarPart, CarPartsService } from '../../services/car-parts.service';
import { CarsService } from '../../services/cars.service';
import { CarDto, CarPartDto } from '../../../api/src/api/api-client';
import { CarPartDialogComponent, CarPartFormData } from '../../components/car-part-dialog/car-part-dialog.component';
import { SnackbarService } from '../../services/snakbar.service';
import { filesToBase64String } from '../../utils/image.util';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CarPartDialogComponent],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.css',
})
export class CarDetailsComponent implements OnInit {
  car: CarDto | undefined = undefined;
  carParts: CarPartDto[] = [];
  isLoading: boolean = true;
  carId: string | null = null;
  carPartDialogVisible = false;
  carPartDialogLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carsService: CarsService,
    private carPartsService: CarPartsService,
    private snackbarService: SnackbarService
  ) {}

  async ngOnInit(): Promise<void> {
    this.carId = this.route.snapshot.paramMap.get('id');

    if (!this.carId) {
      this.router.navigate(['/home']);
      return;
    }

    await this.loadCarDetails();
  }

  async loadCarDetails(): Promise<void> {
    this.isLoading = true;

    try {
      const car = await this.carsService.getById(parseInt(this.carId!, 10));
      if (!car) {
        this.router.navigate(['/home']);
        return;
      }

      this.car = car;
      this.carParts = await this.carPartsService.getByCarId(parseInt(this.carId!, 10));
    } catch (error) {
      console.error('Error loading car details:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  openAddCarPartDialog() {
    this.carPartDialogVisible = true;
  }

  async onCarPartSubmit(carPartData: CarPartFormData) {
    this.carPartDialogLoading = true;
    try {
      const carId = parseInt(this.carId!, 10);
      const status = carPartData.status === 'available' ? 0 : 1;

      // Convert images to base64 strings
      const imagesBase64 =
        carPartData.images.length > 0 ? await filesToBase64String(carPartData.images) : [];

      await this.carPartsService.create(
        carId,
        carPartData.price || 0,
        carPartData.name,
        status,
        carPartData.buyer,
        undefined,
        imagesBase64
      );

      this.snackbarService.successCreate('Car part');
      this.carPartDialogVisible = false;
      this.carPartDialogLoading = false;
      await this.loadCarDetails();
    } catch (error) {
      console.error('Error adding car part:', error);
      this.carPartDialogLoading = false;
      this.snackbarService.genericError();
    }
  }

  async deleteCar() {
    if (!this.carId || !this.car) {
      return;
    }

    const carName = `${this.car.car?.brand} ${this.car.car?.model} ${this.car.car?.manufactureYear}`;
    if (confirm(`Are you sure you want to delete ${carName}?`)) {
      try {
        const response = await this.carsService.delete(parseInt(this.carId, 10));
        if (response.success) {
          this.snackbarService.successDelete('Car');
          this.router.navigate(['/home']);
        } else {
          this.snackbarService.genericError();
        }
      } catch (error) {
        console.error('Error deleting car:', error);
        this.snackbarService.genericError();
      }
    }
  }

  get carsForDropdown(): { label: string; value: string }[] {
    if (!this.car || !this.carId) {
      return [];
    }
    return [{
      label: `${this.car.car?.brand} ${this.car.car?.model} ${this.car.car?.manufactureYear}`,
      value: this.carId
    }];
  }
}
