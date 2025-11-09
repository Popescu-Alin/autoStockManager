import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { SupplierDialogComponent, SupplierFormData } from '../supplier-dialog/supplier-dialog.component';

export interface CarFormData {
  supplier: string;
  purchaseDate: Date | null;
  brand: string;
  model: string;
  manufactureYear: number | null;
  price: string; // Now string for text input
  registrationCertificate: File | null;
  images: File[];
}

@Component({
  selector: 'app-car-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    NgSelectModule,
    ButtonModule,
    SupplierDialogComponent
  ],
  templateUrl: './car-dialog.component.html',
  styleUrl: './car-dialog.component.css'
})
export class CarDialogComponent {
  @Input() visible: boolean = false;
  @Input() suppliers: { label: string; value: string }[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CarFormData>();

  carForm: FormGroup;
  registrationFile: File | null = null;
  imageFiles: File[] = [];
  maxDate: Date = new Date();
  showAddSupplier = false;
  
  get maxDateString(): string {
    return this.maxDate.toISOString().split('T')[0];
  }

  constructor(private fb: FormBuilder) {
    this.carForm = this.fb.group({
      supplier: ['', [Validators.required]],
      purchaseDate: [null, [Validators.required]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      manufactureYear: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      name: ['', [ Validators.required, Validators.minLength(2)]],
      phone: ['', [ Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      ssn: ['', [ Validators.required, Validators.pattern(/^[1-8][0-9]{12}$/)]]
    });
  }

  onDialogHide() {
    this.carForm.reset();
    this.registrationFile = null;
    this.imageFiles = [];
    this.visibleChange.emit(false);
    this.showAddSupplier = false;
  }

  onRegistrationFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.registrationFile = input.files[0];
    }
  }

  onRegistrationFileRemove() {
    this.registrationFile = null;
  }

  onImageFilesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.imageFiles = Array.from(input.files);
    }
  }

  onImageFilesRemove() {
    this.imageFiles = [];
  }

  triggerFileInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  handleSubmit() {
    if (this.carForm.valid && this.registrationFile && this.imageFiles.length > 0) {
      const formData: CarFormData = {
        supplier: this.carForm.value.supplier,
        purchaseDate: this.carForm.value.purchaseDate,
        brand: this.carForm.value.brand,
        model: this.carForm.value.model,
        manufactureYear: this.carForm.value.manufactureYear,
        price: this.carForm.value.price,
        registrationCertificate: this.registrationFile,
        images: this.imageFiles
      };
      
      this.onSubmit.emit(formData);
      this.carForm.reset();
      this.registrationFile = null;
      this.imageFiles = [];
      this.visibleChange.emit(false);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.carForm.controls).forEach(key => {
        this.carForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.carForm.reset();
    this.registrationFile = null;
    this.imageFiles = [];
    this.visibleChange.emit(false);
  }

  onAddSupplierClick() {
    this.showAddSupplier = true;
  }

  onAddSupplierDialogHide() {
    this.showAddSupplier = false;
  }

  handleSupplierDialogSubmit(newSupplier: SupplierFormData) {
    // Add to supplier select list (convert to {label,value}) and select it
    const added = { label: newSupplier.name, value: newSupplier.name };
    this.suppliers = [...this.suppliers, added];
    this.carForm.patchValue({ supplier: added.value });
    this.showAddSupplier = false;
  }

  formatPhoneInline(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length > 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    input.value = value;
    this.carForm.patchValue({ phone: value });
  }

  formatCnpInline(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 13) value = value.substring(0, 13);
    input.value = value;
    this.carForm.patchValue({ ssn: value });
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}

