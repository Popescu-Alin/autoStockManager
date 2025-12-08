import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  invalidToken() {
    this.snackBar.open('Invalid token', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-error',
    });
  }

  genericError() {
    this.snackBar.open('An error occurred', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-error',
    });
  }

  successPasswordSet() {
    this.snackBar.open('Password set successfully!', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-success',
    });
  }
}
