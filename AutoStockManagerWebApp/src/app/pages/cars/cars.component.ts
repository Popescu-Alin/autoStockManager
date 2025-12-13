import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CreateCarRequest } from '../../../api/src/api/api-client';
import {
  CarCardData,
  CarCardItemComponent,
} from '../../components/car-card-item/car-card-item.component';
import { CarDialogComponent, CarFormData } from '../../components/car-dialog/car-dialog.component';
import { AuthService } from '../../services/auth.service';
import { CarPartsService } from '../../services/car-parts.service';
import { CarsService } from '../../services/cars.service';
import { SnackbarService } from '../../services/snakbar.service';
import { SuppliersService } from '../../services/suppliers.service';
import { fileToBase64String, filesToBase64String } from '../../utils/image.util';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, CarDialogComponent, CarCardItemComponent, ButtonModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css',
})
export class CarsComponent implements OnInit {
  protected readonly title = 'Cars';
  protected carDialogVisible = false;
  protected carDialogLoading = false;
  protected carCards: CarCardData[] = [];
  protected suppliers: { label: string; value: string }[] = [];
  protected isLoading = false;
  protected isAdmin = false;

  constructor(
    private carsService: CarsService,
    private suppliersService: SuppliersService,
    private carPartsService: CarPartsService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkAdminStatus();
    await this.loadData();
  }

  private checkAdminStatus(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 0;
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      const [carsData, suppliersData] = await Promise.all([
        this.carsService.getAll(),
        this.suppliersService.getAll(),
      ]);

      // Map suppliers for dropdown
      this.suppliers = suppliersData.map((s) => ({
        label: s.name || '',
        value: s.id?.toString() || '',
      }));

      // Map cars to car cards
      this.carCards = carsData.map((carDto) => {
        const car = carDto.car;
        return {
          id: car?.id || 0,
          brand: car?.brand || '',
          model: car?.model || '',
          manufactureYear: car?.manufactureYear || 0,
          price: car?.purchasePrice || car?.price || 0,
          images: carDto.images || [],
        };
      });
    } catch (error) {
      console.error('Error loading data:', error);
      this.snackbarService.genericError();
    } finally {
      this.isLoading = false;
    }
  }

  openAddCarDialog() {
    this.carDialogVisible = true;
  }

  async onCarSubmit(carData: CarFormData) {
    this.carDialogLoading = true;
    try {
      // Convert files to base64 strings
      const registrationCertificateBase64 = carData.registrationCertificate
        ? await fileToBase64String(carData.registrationCertificate)
        : '';

      const imagesBase64 =
        carData.images.length > 0 ? await filesToBase64String(carData.images) : [];

      // Convert purchaseDate to Date object if it's a string
      let purchaseDate: Date;
      if (carData.purchaseDate instanceof Date) {
        purchaseDate = carData.purchaseDate;
      } else if (typeof carData.purchaseDate === 'string') {
        purchaseDate = new Date(carData.purchaseDate);
      } else {
        purchaseDate = new Date();
      }

      // Create the request object
      const createCarRequest = new CreateCarRequest({
        supplierId: parseInt(carData.supplier, 10),
        purchaseDate: purchaseDate,
        brand: carData.brand,
        model: carData.model,
        manufactureYear: carData.manufactureYear || 0,
        purchasePrice: parseFloat(carData.price),
        vehicleRegistrationCertificate: registrationCertificateBase64,
        images: imagesBase64,
      });

      await this.carsService.create(createCarRequest);
      this.snackbarService.successCreate('Car');
      this.carDialogVisible = false;
      this.carDialogLoading = false;
      await this.loadData();
    } catch (error) {
      console.error('Error adding car:', error);
      this.carDialogLoading = false;
      this.snackbarService.genericError();
    }
  }
}
