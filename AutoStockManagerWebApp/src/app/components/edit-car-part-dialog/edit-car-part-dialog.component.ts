import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CustomersService } from '../../services/customers.service';
import { CarPartFormData } from '../car-part-dialog/car-part-dialog.component';

@Component({
  selector: 'app-edit-car-part-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    NgSelectModule,
    ButtonModule,
  ],
  templateUrl: './edit-car-part-dialog.component.html',
  styleUrl: './edit-car-part-dialog.component.css',
})
export class EditCarPartDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() cars: { label: string; value: string }[] = [];
  @Input() selectedCarId: string | null = null;
  @Input() loading: boolean = false;
  @Input() editingCarPart: CarPartFormData | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CarPartFormData>();

  carPartForm: FormGroup;
  imageFiles: File[] = [];
  existingImages: string[] = []; // Existing images (base64 strings)
  customers: { label: string; value: number }[] = [];

  statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Sold', value: 'sold' },
  ];

  constructor(private fb: FormBuilder, private customersService: CustomersService) {
    this.carPartForm = this.fb.group({
      carId: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      status: ['', [Validators.required]],
      clientId: [null, []],
    });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true && changes['visible']?.previousValue !== true) {
      // Load customers when dialog opens
      await this.loadCustomers();

      if (this.visible && this.carPartForm && this.editingCarPart) {
        this.carPartForm.patchValue({
          carId: this.editingCarPart.carId.toString(),
          price: this.editingCarPart.price,
          name: this.editingCarPart.name,
          status: this.editingCarPart.status,
          clientId: this.editingCarPart.clientId || null,
        });
        this.onStatusChange();
        this.existingImages = this.editingCarPart.existingImages || [];
      }
    }

    if (changes['visible']?.currentValue === false && changes['visible']?.previousValue === true) {
      this.carPartForm.reset();
      this.imageFiles = [];
      this.existingImages = [];
    }
  }

  onDialogHide() {
    this.carPartForm.reset();
    this.imageFiles = [];
    this.existingImages = [];
    this.visibleChange.emit(false);
  }

  async loadCustomers() {
    try {
      const customersList = await this.customersService.getAll();
      this.customers = customersList.map((customer) => ({
        label: customer.name || '',
        value: customer.id || 0,
      }));
    } catch (error) {
      console.error('Error loading customers:', error);
    }
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
        existingImages: this.existingImages,
      };

      this.onSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.carPartForm.controls).forEach((key) => {
        this.carPartForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.carPartForm.reset();
    this.imageFiles = [];
    this.existingImages = [];
    this.visibleChange.emit(false);
  }
}
