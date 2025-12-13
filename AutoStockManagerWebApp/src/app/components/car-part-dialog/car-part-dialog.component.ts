import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

export interface CarPartFormData {
  carId: number;
  price: number;
  name: string;
  status: 'available' | 'sold';
  clientId?: number;
  images: File[];
  existingImages?: string[];
}

@Component({
  selector: 'app-car-part-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    NgSelectModule,
    ButtonModule,
  ],
  templateUrl: './car-part-dialog.component.html',
  styleUrl: './car-part-dialog.component.css',
})
export class CarPartDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() cars: { label: string; value: string }[] = [];
  @Input() selectedCarId: string | null = null;
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CarPartFormData>();

  carPartForm: FormGroup;
  imageFiles: File[] = [];

  statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Sold', value: 'sold' },
  ];

  constructor(private fb: FormBuilder) {
    this.carPartForm = this.fb.group({
      carId: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      status: ['', [Validators.required]],
      clientId: [null, []],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only populate form when dialog becomes visible
    if (changes['visible']?.currentValue === true) {
      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        if (this.visible && this.carPartForm && this.selectedCarId) {
          // New car part - set carId
          this.carPartForm.patchValue({ carId: this.selectedCarId });
        }
      }, 0);
    }

    // Reset form when dialog closes
    if (changes['visible']?.currentValue === false && changes['visible']?.previousValue === true) {
      this.carPartForm.reset();
      this.imageFiles = [];
    }
  }

  onDialogHide() {
    this.carPartForm.reset();
    this.imageFiles = [];
    this.visibleChange.emit(false);
  }

  onStatusChange() {
    const status = this.carPartForm.get('status')?.value;
    const clientIdControl = this.carPartForm.get('clientId');

    if (status === 'sold') {
      clientIdControl?.setValidators([Validators.required]);
    } else {
      clientIdControl?.clearValidators();
      clientIdControl?.setValue(null);
    }
    clientIdControl?.updateValueAndValidity();
  }

  onImageFilesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.imageFiles = Array.from(input.files);
    }
  }

  onImageFilesRemove() {
    this.imageFiles = [];
    const input = document.getElementById('images') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  removeImage(index: number) {
    this.imageFiles.splice(index, 1);
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  triggerFileInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  handleSubmit() {
    if (this.carPartForm.valid && !this.loading) {
      const formData: CarPartFormData = {
        carId: parseInt(this.carPartForm.value.carId, 10),
        price: this.carPartForm.value.price,
        name: this.carPartForm.value.name,
        status: this.carPartForm.value.status,
        clientId: this.carPartForm.value.clientId || undefined,
        images: this.imageFiles,
      };

      this.onSubmit.emit(formData);
    } else {
      Object.keys(this.carPartForm.controls).forEach((key) => {
        this.carPartForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.carPartForm.reset();
    this.imageFiles = [];
    this.visibleChange.emit(false);
  }
}
