import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgSelectModule } from '@ng-select/ng-select';

export interface UserFormData {
  name: string;
  role: string;
  email: string;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    NgSelectModule,
    ButtonModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css'
})
export class UserDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<UserFormData>();

  userForm: FormGroup;
  
  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onDialogHide() {
    this.userForm.reset();
    this.visibleChange.emit(false);
  }

  handleSubmit() {
    if (this.userForm.valid) {
      this.onSubmit.emit(this.userForm.value);
      this.userForm.reset();
      this.visibleChange.emit(false);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.userForm.reset();
    this.visibleChange.emit(false);
  }
}

