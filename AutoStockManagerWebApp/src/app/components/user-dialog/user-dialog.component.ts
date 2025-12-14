import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { User } from '../../../api/src/api/api-client';


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
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<User>();

  userForm: FormGroup;
  
  roleOptions = [
    { label: 'Admin', value: '0' },
    { label: 'User', value: '1' },
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
    if (this.userForm.valid && !this.loading) {
      this.onSubmit.emit(this.userForm.value);
    } else if (!this.userForm.valid) {
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

