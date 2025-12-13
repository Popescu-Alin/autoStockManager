import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerFormData } from '../customer-dialog/customer-dialog.component';

@Component({
  selector: 'app-edit-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './edit-customer-dialog.component.html',
  styleUrl: './edit-customer-dialog.component.css',
})
export class EditCustomerDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() loading: boolean = false;
  @Input() editingCustomer: CustomerFormData | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<CustomerFormData>();

  customerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', []],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true && changes['visible']?.previousValue !== true) {
      if (this.visible && this.customerForm && this.editingCustomer) {
        this.customerForm.patchValue({
          name: this.editingCustomer.name,
          email: this.editingCustomer.email,
          phone: this.editingCustomer.phone,
          address: this.editingCustomer.address || '',
        });
      }
    }

    if (changes['visible']?.currentValue === false && changes['visible']?.previousValue === true) {
      this.customerForm.reset();
    }
  }

  onDialogHide() {
    this.customerForm.reset();
    this.visibleChange.emit(false);
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
    this.customerForm.patchValue({ phone: value });
  }

  handleSubmit() {
    if (this.customerForm.valid && !this.loading) {
      this.onSubmit.emit(this.customerForm.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.customerForm.controls).forEach((key) => {
        this.customerForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.customerForm.reset();
    this.visibleChange.emit(false);
  }
}

