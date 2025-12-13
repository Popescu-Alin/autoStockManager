import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../../api/src/api/api-client';
import {
  UserDialogComponent,
  UserFormData,
} from '../../components/user-dialog/user-dialog.component';
import { SnackbarService } from '../../services/snakbar.service';
import { UsersService } from '../../services/users.service';

export interface UserTableData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'disabled' | 'pending';
  createdAt?: Date;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    ButtonModule,
    InputTextModule,
    UserDialogComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['user', 'fullName', 'status', 'actions'];
  dataSource = new MatTableDataSource<UserTableData>();
  searchValue: string = '';
  userDialogVisible = false;
  userDialogLoading = false;
  isLoading = false;

  private users: UserTableData[] = [];

  constructor(private usersService: UsersService, private snackbarService: SnackbarService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      const users = await this.usersService.getAll();
      this.users = users.map((user) => this.mapUserToTableData(user));
      this.dataSource.data = this.users;
    } catch (error) {
      console.error('Error loading users:', error);
      this.snackbarService.genericError();
    } finally {
      this.isLoading = false;
    }
  }

  private mapUserToTableData(user: User): UserTableData {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || user.name || '';
    return {
      id: user.id?.toString() || '',
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email: user.email || '',
      role: user.role === 1 ? 'admin' : 'user',
      status: this.mapStatus(user.status),
      createdAt: user.createDate,
    };
  }

  private mapStatus(status?: number): 'active' | 'disabled' | 'pending' {
    // Assuming: 0 = active, 1 = disabled, 2 = pending
    if (status === 0) return 'active';
    if (status === 1) return 'disabled';
    return 'pending';
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: UserTableData, filter: string): boolean => {
    const searchTerm = filter.toLowerCase();
    return (
      data.firstName.toLowerCase().includes(searchTerm) ||
      data.lastName.toLowerCase().includes(searchTerm) ||
      data.fullName.toLowerCase().includes(searchTerm) ||
      data.email.toLowerCase().includes(searchTerm) ||
      data.role.toLowerCase().includes(searchTerm) ||
      data.status.toLowerCase().includes(searchTerm)
    );
  };

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddUserDialog() {
    this.userDialogVisible = true;
  }

  async onUserSubmit(userData: UserFormData) {
    this.userDialogLoading = true;
    try {
      const newUser: User = new User({
        firstName: '',
        lastName: '',
        name: userData.name,
        email: userData.email,
        role: userData.role === 'admin' ? 1 : 0,
        status: 2,
      });

      const createdUser = await this.usersService.create(newUser);
      await this.loadUsers();
      this.userDialogVisible = false;
      this.userDialogLoading = false;
      this.snackbarService.successCreate('User');
    } catch (error: any) {
      console.error('Error creating user:', error);
      this.userDialogLoading = false;
      if (error?.status === 409 || error?.message?.includes('Email Already Taken')) {
        this.snackbarService.emailAlreadyTaken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  async deleteUser(user: UserTableData) {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      try {
        const response = await this.usersService.delete(parseInt(user.id, 10));
        if (response.success) {
          await this.loadUsers();
          this.snackbarService.successDelete('User');
        } else {
          this.snackbarService.genericError();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        this.snackbarService.genericError();
      }
    }
  }

  async disableUser(user: UserTableData) {
    try {
      const currentUser = await this.usersService.getById(user.id);

      const newStatus = user.status === 'disabled' ? 0 : 1; // 0 = active, 1 = disabled
      const updatedUser: User = new User({
        id: currentUser.id,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        role: currentUser.role,
        createDate: currentUser.createDate,
        identityUserId: currentUser.identityUserId,
        status: newStatus,
      });

      await this.usersService.update(user.id, updatedUser);
      await this.loadUsers();
      const statusMessage = newStatus === 0 ? 'enabled' : 'disabled';
      this.snackbarService.success(`User ${statusMessage} successfully!`);
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error?.status === 409 || error?.message?.includes('Email Already Taken')) {
        this.snackbarService.emailAlreadyTaken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  sendChangePassword(user: UserTableData) {
    // TODO: Implement send change password functionality
    console.log('Send change password to:', user.email);
    alert(`Change password email will be sent to ${user.email}`);
  }

  resendInvite(user: UserTableData) {
    // TODO: Implement resend invite functionality
    console.log('Resend invite to:', user.email);
    alert(`Invitation will be resent to ${user.email}`);
  }
}
