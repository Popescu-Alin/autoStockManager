import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snakbar.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  isValidating: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
      }
      return null;
    };

    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  async ngOnInit(): Promise<void> {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    await this.validateToken();
  }

  async validateToken(): Promise<void> {
    this.isValidating = true;

    try {
      const response = await this.authService.validateResetToken(this.token!);
      this.isValidating = false;
      if (!response) {
        this.router.navigate(['/auth/login']);
        this.snackbarService.invalidToken();
        return;
      }
    } catch (error) {
      this.isValidating = false;
      this.router.navigate(['/auth/login']);
      this.snackbarService.genericError();
      return;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid || !this.token) {
      Object.keys(this.resetPasswordForm.controls).forEach((key) => {
        this.resetPasswordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const formValue = this.resetPasswordForm.value;
    const passwordResetData = {
      token: this.token!,
      password: formValue.password,
    };

    try {
      // const response = await this.authService.setPassword(passwordResetData);
      const response = true;
      this.isSubmitting = false;
      if (response) {
        this.router.navigate(['/auth/login']);
        this.snackbarService.successPasswordSet();
      } else {
        this.snackbarService.genericError();
      }
    } catch (error) {
      this.isSubmitting = false;
      this.snackbarService.genericError();
    }
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  get passwordMismatch() {
    return this.resetPasswordForm.errors?.['passwordMismatch'] && this.confirmPassword?.touched;
  }
}
