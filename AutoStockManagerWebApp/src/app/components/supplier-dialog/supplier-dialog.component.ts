import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

export interface SupplierFormData {
  name: string;
  phone: string;
  ssn: string;
}

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './supplier-dialog.component.html',
  styleUrl: './supplier-dialog.component.css'
})
export class SupplierDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<SupplierFormData>();

  supplierForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      ssn: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]]
    });
  }

  onDialogHide() {
    this.visibleChange.emit(false);
  }

  formatSSN(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    
    if (value.length > 5) {
      value = `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5)}`;
    } else if (value.length > 3) {
      value = `${value.substring(0, 3)}-${value.substring(3)}`;
    }
    
    input.value = value;
    this.supplierForm.patchValue({ ssn: value });
  }

  formatPhone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length > 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    input.value = value;
    this.supplierForm.patchValue({ phone: value });
  }

  handleSubmit() {
    if (this.supplierForm.valid) {
      this.onSubmit.emit(this.supplierForm.value);
      this.supplierForm.reset();
      this.visibleChange.emit(false);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.supplierForm.reset();
    this.visibleChange.emit(false);
  }
}

