import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snakbar.service';
import { AuthRequest } from '../../../../api/src/api/api-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async ngOnInit(): Promise<void> {
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const formValue = this.loginForm.value;
    const loginData: AuthRequest = new AuthRequest({
      email: formValue.email,
      password: formValue.password,
    });

    try {
      const response = await this.authService.login(loginData);
      this.isSubmitting = false;
      if (response && response.token) {
        this.authService.setToken(response.token);
        this.authService.setCurrentUser(response.user!);
        this.router.navigate(['/home']);
      } else {
        this.snackbarService.genericError();
      }
    } catch (error) {
      this.isSubmitting = false;
      this.snackbarService.genericError();
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
