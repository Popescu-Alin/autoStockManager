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
import { ActivateAccountRequest } from '../../../../api/src/api/api-client';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snakbar.service';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.css',
})
export class ActivateAccountComponent implements OnInit {
  activateAccountForm: FormGroup;
  token: string | null = null;
  isValidating: boolean = true;
  isSubmitting: boolean = false;
  tokenValid: boolean = false;

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

    const strongPasswordValidator = (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 8;

      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !hasMinLength) {
        return { weakPassword: true };
      }

      return null;
    };

    this.activateAccountForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  async ngOnInit(): Promise<void> {
    // Get token from route params (path parameter) instead of query params
    this.token = this.route.snapshot.paramMap.get('token');
    console.log('Token from route params:', this.token);

    // Also try query params as fallback (in case route is accessed differently)
    if (!this.token) {
      this.token = this.route.snapshot.queryParamMap.get('token');
      console.log('Token from query params:', this.token);
    }

    if (!this.token) {
      console.error('No token found in route or query params');
      this.router.navigate(['/auth/login']);
      this.snackbarService.invalidToken();
      return;
    }

    await this.validateToken();
  }

  async validateToken(): Promise<void> {
    this.isValidating = true;

    try {
      const response = await this.authService.validateActivationToken(this.token!);
      this.isValidating = false;

      if (response.success && !response.invalidToken && !response.expiredToken) {
        this.tokenValid = true;
      } else {
        this.router.navigate(['/auth/login']);
        if (response.expiredToken) {
          this.snackbarService.error('Activation token has expired');
        } else {
          this.snackbarService.invalidToken();
        }
      }
    } catch (error) {
      this.isValidating = false;
      this.router.navigate(['/auth/login']);
      this.snackbarService.invalidToken();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.activateAccountForm.invalid || !this.token || !this.tokenValid) {
      Object.keys(this.activateAccountForm.controls).forEach((key) => {
        this.activateAccountForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const formValue = this.activateAccountForm.value;
    const activateAccountData = new ActivateAccountRequest({
      token: this.token!,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
    });

    try {
      const response = await this.authService.activateAccount(activateAccountData);
      this.isSubmitting = false;
      if (response.success) {
        this.router.navigate(['/auth/login']);
        this.snackbarService.successAccountActivated();
      } else {
        this.snackbarService.genericError();
      }
    } catch (error: any) {
      this.isSubmitting = false;
      if (error?.status === 400) {
        this.snackbarService.error('Invalid password. Please ensure it meets all requirements.');
      } else if (error?.status === 401) {
        this.router.navigate(['/auth/login']);
        this.snackbarService.invalidToken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  get password() {
    return this.activateAccountForm.get('password');
  }

  get confirmPassword() {
    return this.activateAccountForm.get('confirmPassword');
  }

  get passwordMismatch() {
    return this.activateAccountForm.errors?.['passwordMismatch'] && this.confirmPassword?.touched;
  }

  get passwordErrors() {
    const errors = this.password?.errors;
    if (!errors) return null;

    const errorMessages: string[] = [];
    if (errors['required']) errorMessages.push('Password is required');
    if (errors['minlength']) errorMessages.push('Password must be at least 8 characters');
    if (errors['weakPassword']) {
      errorMessages.push(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    }
    return errorMessages;
  }
}
