import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  CarCardData,
  CarCardItemComponent,
} from '../../components/car-card-item/car-card-item.component';
import { CarDialogComponent, CarFormData } from '../../components/car-dialog/car-dialog.component';
import {
  CarPartDialogComponent,
  CarPartFormData,
} from '../../components/car-part-dialog/car-part-dialog.component';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [
    CommonModule,
    CarDialogComponent,
    CarPartDialogComponent,
    CarCardItemComponent,
    ButtonModule,
  ],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css',
})
export class CarsComponent {
  protected readonly title = 'Cars';
  protected carDialogVisible = false;
  protected carPartDialogVisible = false;

  // Mock suppliers data - in real app, this would come from a service
  protected suppliers = [
    { label: 'Supplier 1', value: 'supplier1' },
    { label: 'Supplier 2', value: 'supplier2' },
    { label: 'Supplier 3', value: 'supplier3' },
  ];

  // Mock cars data - in real app, this would come from a service
  protected cars = [
    { label: 'Car 1 - Brand Model 2020', value: 'car1' },
    { label: 'Car 2 - Brand Model 2021', value: 'car2' },
    { label: 'Car 3 - Brand Model 2022', value: 'car3' },
  ];

  // Mock car cards data with images for carousel display
  protected carCards: CarCardData[] = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Camry',
      manufactureYear: 2020,
      price: 25000,
      supplierName: 'Supplier 1',
      images: [
        'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Toyota+Camry+1',
        'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Toyota+Camry+2',
        'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Toyota+Camry+3',
      ],
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Accord',
      manufactureYear: 2021,
      price: 28000,
      supplierName: 'Supplier 2',
      images: [
        'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Honda+Accord+1',
        'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Honda+Accord+2',
        'https://via.placeholder.com/400x300/00BCD4/FFFFFF?text=Honda+Accord+3',
      ],
    },
    {
      id: 3,
      brand: 'Ford',
      model: 'Mustang',
      manufactureYear: 2022,
      price: 35000,
      supplierName: 'Supplier 3',
      images: [
        'https://via.placeholder.com/400x300/E91E63/FFFFFF?text=Ford+Mustang+1',
        'https://via.placeholder.com/400x300/795548/FFFFFF?text=Ford+Mustang+2',
        'https://via.placeholder.com/400x300/607D8B/FFFFFF?text=Ford+Mustang+3',
      ],
    },
  ];

  openAddCarDialog() {
    this.carDialogVisible = true;
  }

  openAddCarPartDialog() {
    this.carPartDialogVisible = true;
  }

  onCarSubmit(carData: CarFormData) {
    console.log('Car added:', carData);
    // TODO: Handle car data submission (e.g., send to API, add to list, etc.)
    const fileNames = carData.images.map((img) => img.name).join(', ');
    alert(
      `Car added successfully!\nBrand: ${carData.brand}\nModel: ${carData.model}\nYear: ${carData.manufactureYear}\nSupplier: ${carData.supplier}\nPurchase Date: ${carData.purchaseDate}\nRegistration: ${carData.registrationCertificate?.name}\nImages: ${fileNames}`
    );
  }

  onCarPartSubmit(carPartData: CarPartFormData) {
    console.log('Car part added:', carPartData);
    // TODO: Handle car part data submission (e.g., send to API, add to list, etc.)
    const imageNames =
      carPartData.images.length > 0
        ? carPartData.images.map((img) => img.name).join(', ')
        : 'No images';
    alert(
      `Car part added successfully!\nName: ${carPartData.name}\nCar: ${carPartData.car}\nPrice: $${carPartData.price}\nStatus: ${carPartData.status}\nBuyer: ${
        carPartData.buyer || 'N/A'
      }\nImages: ${imageNames}`
    );
  }
}


