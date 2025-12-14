import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../../api/src/api/api-client';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    NgSelectModule,
    ButtonModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.css',
})
export class EditUserDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() loading: boolean = false;
  @Input() editingUser: User | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<User>();

  userForm: FormGroup;

  roleOptions = [
    { label: 'Admin', value: 0 },
    { label: 'User', value: 1 },
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true && changes['visible']?.previousValue !== true) {
      if (this.visible && this.userForm && this.editingUser) {
        this.userForm.patchValue({
          name: this.editingUser.name,
          role: this.editingUser.role,
          email: this.editingUser.email,
        });
      }
    }

    if (changes['visible']?.currentValue === false && changes['visible']?.previousValue === true) {
      this.userForm.reset();
    }
  }

  onDialogHide() {
    this.userForm.reset();
    this.visibleChange.emit(false);
  }

  handleSubmit() {
    if (this.userForm.valid && !this.loading) {
      const formValue = this.userForm.value;
      const userData = new User({
        ...this.editingUser,
        name: formValue.name,
        role: formValue.role,
        email: formValue.email,
      });
      this.onSubmit.emit(userData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  handleCancel() {
    this.userForm.reset();
    this.visibleChange.emit(false);
  }
}
