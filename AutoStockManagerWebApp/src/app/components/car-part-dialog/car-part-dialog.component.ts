import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgSelectModule } from '@ng-select/ng-select';

export interface CarPartFormData {
  car: string;
  price: number | null;
  name: string;
  status: string;
  buyer: string;
  images: File[];
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
    ButtonModule
  ],
  templateUrl: './car-part-dialog.component.html',
  styleUrl: './car-part-dialog.component.css'
})
export class CarPartDialogComponent {
  @Input() visible: boolean = false;
  @Input() cars: { label: string; value: string }[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CarPartFormData>();

  carPartForm: FormGroup;
  imageFiles: File[] = [];

  statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Sold', value: 'sold' }
  ];

  constructor(private fb: FormBuilder) {
    this.carPartForm = this.fb.group({
      car: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      status: ['', [Validators.required]],
      buyer: ['', []]
    });
  }

  onDialogHide() {
    this.carPartForm.reset();
    this.imageFiles = [];
    this.visibleChange.emit(false);
  }

  onStatusChange() {
    const status = this.carPartForm.get('status')?.value;
    const buyerControl = this.carPartForm.get('buyer');
    
    if (status === 'sold') {
      buyerControl?.setValidators([Validators.required]);
    } else {
      buyerControl?.clearValidators();
      buyerControl?.setValue('');
    }
    buyerControl?.updateValueAndValidity();
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

  triggerFileInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  handleSubmit() {
    if (this.carPartForm.valid) {
      const formData: CarPartFormData = {
        car: this.carPartForm.value.car,
        price: this.carPartForm.value.price,
        name: this.carPartForm.value.name,
        status: this.carPartForm.value.status,
        buyer: this.carPartForm.value.buyer || '',
        images: this.imageFiles
      };
      
      this.onSubmit.emit(formData);
      this.carPartForm.reset();
      this.imageFiles = [];
      this.visibleChange.emit(false);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.carPartForm.controls).forEach(key => {
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

