import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

export interface SupplierFormData {
  name: string;
  phone: string;
  ssn: string;
}

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule],
  templateUrl: './supplier-dialog.component.html',
  styleUrl: './supplier-dialog.component.css',
})
export class SupplierDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() editMode: boolean = false;
  @Input() supplierData: SupplierFormData | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<SupplierFormData>();

  supplierForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      ssn: ['', [Validators.required, Validators.pattern(/^[1-8][0-9]{12}$/)]], // CNP, Romanian format
    });
  }

  ngOnChanges() {
    if (this.visible) {
      if (this.editMode && this.supplierData) {
        this.supplierForm.patchValue({
          name: this.supplierData.name,
          phone: this.supplierData.phone,
          ssn: this.supplierData.ssn,
        });
      } else if (!this.editMode) {
        this.supplierForm.reset();
      }
    }
  }

  onDialogHide() {
    this.supplierForm.reset();
    this.visibleChange.emit(false);
  }

  formatSSN(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Only digits
    if (value.length > 13) value = value.substring(0, 13);
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
      Object.keys(this.supplierForm.controls).forEach((key) => {
        this.supplierForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.supplierForm.reset();
    this.visibleChange.emit(false);
  }
}
