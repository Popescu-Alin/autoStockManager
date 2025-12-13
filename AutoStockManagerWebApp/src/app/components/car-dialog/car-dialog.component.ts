import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

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
  ],
  templateUrl: './car-dialog.component.html',
  styleUrl: './car-dialog.component.css',
})
export class CarDialogComponent {
  @Input() visible: boolean = false;
  @Input() suppliers: { label: string; value: string }[] = [];
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CarFormData>();

  carForm: FormGroup;
  registrationFile: File | null = null;
  imageFiles: File[] = [];
  maxDate: Date = new Date();

  get maxDateString(): string {
    return this.maxDate.toISOString().split('T')[0];
  }

  constructor(private fb: FormBuilder) {
    this.carForm = this.fb.group({
      supplier: ['', [Validators.required]],
      purchaseDate: [null, [Validators.required]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      manufactureYear: [
        null,
        [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)],
      ],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    });
  }

  onDialogHide() {
    this.carForm.reset();
    this.registrationFile = null;
    this.imageFiles = [];
    this.visibleChange.emit(false);
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
    if (this.carForm.valid && this.registrationFile && this.imageFiles.length > 0 && !this.loading) {
      const formData: CarFormData = {
        supplier: this.carForm.value.supplier,
        purchaseDate: this.carForm.value.purchaseDate,
        brand: this.carForm.value.brand,
        model: this.carForm.value.model,
        manufactureYear: this.carForm.value.manufactureYear,
        price: this.carForm.value.price,
        registrationCertificate: this.registrationFile,
        images: this.imageFiles,
      };

      this.onSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.carForm.controls).forEach((key) => {
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

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
