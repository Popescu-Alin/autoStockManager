import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';
import { ApiClient, CarDto, CarPartDto, UpdateCarRequest } from '../../../api/src/api/api-client';
import { CarFormData } from '../../components/car-dialog/car-dialog.component';
import {
  CarPartDialogComponent,
  CarPartFormData,
} from '../../components/car-part-dialog/car-part-dialog.component';
import { EditCarDialogComponent } from '../../components/edit-car-dialog/edit-car-dialog.component';
import { EditCarPartDialogComponent } from '../../components/edit-car-part-dialog/edit-car-part-dialog.component';
import { AuthService } from '../../services/auth.service';
import { CarPartsService } from '../../services/car-parts.service';
import { CarsService } from '../../services/cars.service';
import { SnackbarService } from '../../services/snakbar.service';
import { SuppliersService } from '../../services/suppliers.service';
import { filesToBase64String, fileToBase64String } from '../../utils/image.util';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CarPartDialogComponent,
    EditCarPartDialogComponent,
    EditCarDialogComponent,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.css',
})
export class CarDetailsComponent implements OnInit {
  car: CarDto | undefined = undefined;
  carParts: CarPartDto[] = [];
  filteredCarParts: CarPartDto[] = [];
  isLoading: boolean = true;
  carId: string | null = null;
  carPartDialogVisible = false;
  carPartDialogLoading = false;
  editCarDialogVisible = false;
  editCarDialogLoading = false;
  editCarPartDialogVisible = false;
  editCarPartDialogLoading = false;
  editingCarPart: CarPartDto | null = null;
  filterName: string = '';
  filterStatus: string = 'all';
  isAdmin = false;
  suppliers: { label: string; value: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carsService: CarsService,
    private carPartsService: CarPartsService,
    private suppliersService: SuppliersService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private apiClient: ApiClient
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkAdminStatus();
    this.carId = this.route.snapshot.paramMap.get('id');

    if (!this.carId) {
      this.router.navigate(['/home']);
      return;
    }

    await this.loadCarDetails();
  }

  private checkAdminStatus(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 0;
  }

  async loadCarDetails(): Promise<void> {
    this.isLoading = true;

    try {
      const [car, suppliersData] = await Promise.all([
        this.carsService.getById(parseInt(this.carId!, 10)),
        this.suppliersService.getAll(),
      ]);

      if (!car) {
        this.router.navigate(['/home']);
        return;
      }

      this.car = car;
      this.carParts = await this.carPartsService.getByCarId(parseInt(this.carId!, 10));
      this.filteredCarParts = [...this.carParts];

      this.suppliers = suppliersData.map((s) => ({
        label: s.name || '',
        value: s.id?.toString() || '',
      }));
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
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
    }).format(amount);
  }

  getAmountSold(): number {
    if (!this.carParts || this.carParts.length === 0) return 0;
    return this.carParts
      .filter((part) => part.carPart?.status === 0)
      .reduce((sum, part) => sum + (part.carPart?.price || 0), 0);
  }

  async downloadRegistrationCertificate(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.car?.car?.vehicleRegistrationCertificate) {
      this.snackbarService.error('Registration certificate not available');
      return;
    }

    try {
      const imageId = this.car.car.vehicleRegistrationCertificate;

      const response = await firstValueFrom(this.apiClient.getImagesImageId(imageId));

      const image = response.image;

      let mimeType = 'application/pdf';
      let base64Data = image;

      if (image.includes(',')) {
        const parts = image.split(',');
        const prefix = parts[0];
        base64Data = parts[1];

        if (prefix.startsWith('data:')) {
          const mimeMatch = prefix.match(/data:([^;]+)/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        }
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const imageBlob = new Blob([byteArray], { type: mimeType });
      const imageUrl = URL.createObjectURL(imageBlob);
      window.open(imageUrl, '_blank');
    } catch (error: any) {
      this.snackbarService.error('Failed to download registration certificate');
    }
  }

  getStatusText(status: number | undefined): string {
    if (status === 0) return 'Sold';
    if (status === 1) return 'Available';
    return 'Unknown';
  }

  openAddCarPartDialog() {
    this.editingCarPart = null;
    this.carPartDialogVisible = true;
  }

  openEditCarPartDialog(part: CarPartDto) {
    this.editingCarPart = part;
    this.editCarPartDialogVisible = true;
  }

  openEditCarDialog() {
    this.editCarDialogVisible = true;
  }

  async onCarPartSubmit(carPartData: CarPartFormData) {
    this.carPartDialogLoading = true;
    try {
      const status = carPartData.status === 'available' ? 1 : 0;

      const newImagesBase64 =
        carPartData.images.length > 0 ? await filesToBase64String(carPartData.images) : [];

      await this.carPartsService.create(
        carPartData.carId,
        carPartData.price,
        carPartData.name,
        status,
        undefined,
        carPartData.clientId,
        newImagesBase64
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

  async onEditCarPartSubmit(carPartData: CarPartFormData) {
    this.editCarPartDialogLoading = true;
    try {
      const newImagesBase64 =
        carPartData.images.length > 0 ? await filesToBase64String(carPartData.images) : [];

      const statusValue: 'available' | 'sold' =
        carPartData.status === 'available' ? 'available' : 'sold';

      const imagesBase64 = [...(carPartData.existingImages || []), ...newImagesBase64];

      await this.carPartsService.update(this.editingCarPart!.carPart?.id?.toString() || '', {
        car: carPartData.carId.toString(),
        price: carPartData.price,
        name: carPartData.name,
        status: statusValue,
        buyer: undefined,
        clientId: carPartData.clientId,
        images: imagesBase64,
      });

      this.snackbarService.successUpdate('Car part');
      this.editCarPartDialogVisible = false;
      this.editCarPartDialogLoading = false;
      this.editingCarPart = null;
      await this.loadCarDetails();
    } catch (error) {
      console.error('Error updating car part:', error);
      this.editCarPartDialogLoading = false;
      this.snackbarService.genericError();
    }
  }

  async onEditCarSubmit(carData: CarFormData) {
    this.editCarDialogLoading = true;
    try {
      const registrationCertificateBase64 = carData.registrationCertificate
        ? await fileToBase64String(carData.registrationCertificate)
        : this.car?.car?.vehicleRegistrationCertificate || '';

      const newImagesBase64 =
        carData.images.length > 0 ? await filesToBase64String(carData.images) : [];

      const imagesBase64 = [...(carData.existingImages || []), ...newImagesBase64];

      const purchaseDate =
        carData.purchaseDate instanceof Date
          ? carData.purchaseDate
          : carData.purchaseDate
          ? new Date(carData.purchaseDate)
          : this.car?.car?.purchaseDate
          ? new Date(this.car.car.purchaseDate)
          : new Date();
      const updateCarRequest = new UpdateCarRequest({
        supplierId: parseInt(carData.supplier, 10),
        purchaseDate: purchaseDate,
        brand: carData.brand,
        model: carData.model,
        manufactureYear: carData.manufactureYear || 0,
        purchasePrice: parseFloat(carData.price),
        vehicleRegistrationCertificate: registrationCertificateBase64,
        images: imagesBase64,
      });

      await this.carsService.update(parseInt(this.carId!, 10), updateCarRequest);
      this.snackbarService.successUpdate('Car');
      this.editCarDialogVisible = false;
      this.editCarDialogLoading = false;
      await this.loadCarDetails();
    } catch (error) {
      console.error('Error updating car:', error);
      this.editCarDialogLoading = false;
      this.snackbarService.genericError();
    }
  }

  async deleteCarPart(part: CarPartDto) {
    if (!part.carPart?.id) {
      return;
    }

    const partName = part.carPart.name || 'this car part';
    if (confirm(`Are you sure you want to delete ${partName}?`)) {
      try {
        const response = await this.carPartsService.delete(part.carPart.id);
        if (response.success) {
          this.snackbarService.successDelete('Car part');
          await this.loadCarDetails();
        } else {
          this.snackbarService.genericError();
        }
      } catch (error) {
        console.error('Error deleting car part:', error);
        this.snackbarService.genericError();
      }
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
    return [
      {
        label: `${this.car.car?.brand} ${this.car.car?.model} ${this.car.car?.manufactureYear}`,
        value: this.carId,
      },
    ];
  }

  filterCarParts() {
    this.filteredCarParts = this.carParts.filter((part) => {
      const nameMatch =
        !this.filterName ||
        part.carPart?.name?.toLowerCase().includes(this.filterName.toLowerCase());
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'available' && part.carPart?.status === 1) ||
        (this.filterStatus === 'sold' && part.carPart?.status === 0);
      return nameMatch && statusMatch;
    });
  }

  get editingCarPartData(): CarPartFormData | null {
    if (!this.editingCarPart) return null;
    return {
      carId: this.editingCarPart.carPart?.carId || parseInt(this.carId || '0', 10),
      price: this.editingCarPart.carPart?.price || 0,
      name: this.editingCarPart.carPart?.name || '',
      status: this.editingCarPart.carPart?.status === 1 ? 'available' : 'sold',
      clientId: this.editingCarPart.carPart?.customerId || undefined,
      images: [],
      existingImages: this.editingCarPart.images || [],
    };
  }

  get editingCarData(): CarFormData | null {
    if (!this.car) return null;
    return {
      supplier: this.car.car?.supplierId?.toString() || '',
      purchaseDate: this.car.car?.purchaseDate ? new Date(this.car.car.purchaseDate) : null,
      brand: this.car.car?.brand || '',
      model: this.car.car?.model || '',
      manufactureYear: this.car.car?.manufactureYear || null,
      price: (this.car.car?.purchasePrice || this.car.car?.price || 0).toString(),
      registrationCertificate: null,
      images: [],
      existingImages: this.car.images || [],
    };
  }
}
