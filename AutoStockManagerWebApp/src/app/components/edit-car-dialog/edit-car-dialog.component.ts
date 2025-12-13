import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CarFormData } from '../car-dialog/car-dialog.component';

@Component({
  selector: 'app-edit-car-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    NgSelectModule,
    ButtonModule,
  ],
  templateUrl: './edit-car-dialog.component.html',
  styleUrl: './edit-car-dialog.component.css',
})
export class EditCarDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() suppliers: { label: string; value: string }[] = [];
  @Input() loading: boolean = false;
  @Input() editingCar: CarFormData | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CarFormData>();

  carForm: FormGroup;
  registrationFile: File | null = null;
  imageFiles: File[] = [];
  existingImages: string[] = []; // Existing images (base64 strings)
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true && changes['visible']?.previousValue !== true) {
      if (this.visible && this.carForm && this.editingCar) {
        this.carForm.patchValue({
          supplier: this.editingCar.supplier,
          purchaseDate: this.editingCar.purchaseDate,
          brand: this.editingCar.brand,
          model: this.editingCar.model,
          manufactureYear: this.editingCar.manufactureYear,
          price: this.editingCar.price,
        });
        this.existingImages = this.editingCar.existingImages || [];
      }
    }

    if (changes['visible']?.currentValue === false && changes['visible']?.previousValue === true) {
      this.carForm.reset();
      this.registrationFile = null;
      this.imageFiles = [];
      this.existingImages = [];
    }
  }

  onDialogHide() {
    this.carForm.reset();
    this.registrationFile = null;
    this.imageFiles = [];
    this.existingImages = [];
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
      const newFiles = Array.from(input.files);
      this.imageFiles = [...this.imageFiles, ...newFiles];
    }
  }

  removeNewImage(index: number) {
    this.imageFiles.splice(index, 1);
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  triggerFileInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  handleSubmit() {
    const hasImages = this.existingImages.length > 0 || this.imageFiles.length > 0;
    const isValid = this.carForm.valid && hasImages && !this.loading;

    if (isValid) {
      const formData: CarFormData = {
        supplier: this.carForm.value.supplier,
        purchaseDate: this.carForm.value.purchaseDate,
        brand: this.carForm.value.brand,
        model: this.carForm.value.model,
        manufactureYear: this.carForm.value.manufactureYear,
        price: this.carForm.value.price,
        registrationCertificate: this.registrationFile,
        images: this.imageFiles,
        existingImages: this.existingImages,
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
    this.existingImages = [];
    this.visibleChange.emit(false);
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }
}
