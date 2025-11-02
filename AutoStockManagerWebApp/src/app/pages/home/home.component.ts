import { Component } from '@angular/core';
import { UserDialogComponent, UserFormData } from '../../components/user-dialog/user-dialog.component';
import { SupplierDialogComponent, SupplierFormData } from '../../components/supplier-dialog/supplier-dialog.component';
import { CarDialogComponent, CarFormData } from '../../components/car-dialog/car-dialog.component';
import { CarPartDialogComponent, CarPartFormData } from '../../components/car-part-dialog/car-part-dialog.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  imports: [UserDialogComponent, SupplierDialogComponent, CarDialogComponent, CarPartDialogComponent, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  protected readonly title = 'Welcome to Auto Stock Manager';
  protected userDialogVisible = false;
  protected supplierDialogVisible = false;
  protected carDialogVisible = false;
  protected carPartDialogVisible = false;
  
  // Mock suppliers data - in real app, this would come from a service
  protected suppliers = [
    { label: 'Supplier 1', value: 'supplier1' },
    { label: 'Supplier 2', value: 'supplier2' },
    { label: 'Supplier 3', value: 'supplier3' }
  ];

  // Mock cars data - in real app, this would come from a service
  protected cars = [
    { label: 'Car 1 - Brand Model 2020', value: 'car1' },
    { label: 'Car 2 - Brand Model 2021', value: 'car2' },
    { label: 'Car 3 - Brand Model 2022', value: 'car3' }
  ];

  openAddUserDialog() {
    this.userDialogVisible = true;
  }

  openAddSupplierDialog() {
    this.supplierDialogVisible = true;
  }

  openAddCarDialog() {
    this.carDialogVisible = true;
  }

  openAddCarPartDialog() {
    this.carPartDialogVisible = true;
  }

  onUserSubmit(userData: UserFormData) {
    console.log('User added:', userData);
    // TODO: Handle user data submission (e.g., send to API, add to list, etc.)
    alert(`User added successfully!\nName: ${userData.name}\nRole: ${userData.role}\nEmail: ${userData.email}`);
  }

  onSupplierSubmit(supplierData: SupplierFormData) {
    console.log('Supplier added:', supplierData);
    // TODO: Handle supplier data submission (e.g., send to API, add to list, etc.)
    alert(`Supplier added successfully!\nName: ${supplierData.name}\nPhone: ${supplierData.phone}\nSSN: ${supplierData.ssn}`);
  }

  onCarSubmit(carData: CarFormData) {
    console.log('Car added:', carData);
    // TODO: Handle car data submission (e.g., send to API, add to list, etc.)
    const fileNames = carData.images.map(img => img.name).join(', ');
    alert(`Car added successfully!\nBrand: ${carData.brand}\nModel: ${carData.model}\nYear: ${carData.manufactureYear}\nSupplier: ${carData.supplier}\nPurchase Date: ${carData.purchaseDate}\nRegistration: ${carData.registrationCertificate?.name}\nImages: ${fileNames}`);
  }

  onCarPartSubmit(carPartData: CarPartFormData) {
    console.log('Car part added:', carPartData);
    // TODO: Handle car part data submission (e.g., send to API, add to list, etc.)
    const imageNames = carPartData.images.length > 0 
      ? carPartData.images.map(img => img.name).join(', ')
      : 'No images';
    alert(`Car part added successfully!\nName: ${carPartData.name}\nCar: ${carPartData.car}\nPrice: $${carPartData.price}\nStatus: ${carPartData.status}\nBuyer: ${carPartData.buyer || 'N/A'}\nImages: ${imageNames}`);
  }
}

