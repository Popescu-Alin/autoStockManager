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
import { EditUserDialogComponent } from '../../components/edit-user-dialog/edit-user-dialog.component';
import { UserDialogComponent } from '../../components/user-dialog/user-dialog.component';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snakbar.service';
import { UsersService } from '../../services/users.service';

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
    EditUserDialogComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['user', 'fullName', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>();
  searchValue: string = '';
  userDialogVisible = false;
  userDialogLoading = false;
  editUserDialogVisible = false;
  editUserDialogLoading = false;
  editingUser: User | null = null;
  isLoading = false;
  currentUser: User | undefined = undefined;
  private users: User[] = [];

  constructor(
    private usersService: UsersService,
    private snackbarService: SnackbarService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadUsers();
    this.currentUser = this.authService.getCurrentUser();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      this.users = await this.usersService.getAll();
      this.dataSource.data = this.users;
    } catch (error) {
      console.error('Error loading users:', error);
      this.snackbarService.genericError();
    } finally {
      this.isLoading = false;
    }
  }

  mapStatus(status?: number): 'active' | 'disabled' | 'pending' {
    if (status === 0) return 'active';
    if (status === 1) return 'disabled';
    return 'pending';
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: User, filter: string): boolean => {
    const searchTerm = filter.toLowerCase();
    return (
      data.name?.toLowerCase().includes(searchTerm) ||
      data.email?.toLowerCase().includes(searchTerm) ||
      data.role?.toString().toLowerCase().includes(searchTerm) ||
      this.mapStatus(data.status).toLowerCase().includes(searchTerm)
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

  openEditUserDialog(userId: number) {
    this.editingUser = this.users.find((user) => user.id === userId) || null;
    this.editUserDialogVisible = true;
  }

  async onUserSubmit(userData: User) {
    this.userDialogLoading = true;
    try {
      const newUser: User = new User({
        firstName: '',
        lastName: '',
        name: userData.name,
        email: userData.email,
        role: userData.role,
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

  async onEditUserSubmit(userData: User) {
    if (!this.editingUser) return;

    this.editUserDialogLoading = true;
    try {
      await this.usersService.update(this.editingUser.id!, userData);
      this.snackbarService.successUpdate('User');
      this.editUserDialogVisible = false;
      this.editUserDialogLoading = false;
      this.editingUser = null;
      await this.loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      this.editUserDialogLoading = false;
      if (error?.status === 409 || error?.message?.includes('Email Already Taken')) {
        this.snackbarService.emailAlreadyTaken();
      } else {
        this.snackbarService.genericError();
      }
    }
  }

  async deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const response = await this.usersService.delete(user.id!);
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

  async changeUserStatus(user: User) {
    try {
      const newStatus = user.status === 0 ? 1 : user.status === 1 ? 0 : 1;
      const updatedUser = await this.usersService.changeStatus(user.id!, newStatus);
      await this.loadUsers();
      const statusMessage = newStatus === 0 ? 'enabled' : 'disabled';
      this.snackbarService.success(`User ${statusMessage} successfully!`);
    } catch (error: any) {
      console.error('Error changing user status:', error);
      this.snackbarService.genericError();
    }
  }

  async sendChangePassword(userId: number) {
    try {
      const response = await this.usersService.sendChangePassword(userId);
      if (response.success) {
        this.snackbarService.success(
          `Change password email sent to ${this.users.find((user) => user.id === userId)?.email}`
        );
      } else {
        this.snackbarService.genericError();
      }
    } catch (error) {
      console.error('Error sending change password email:', error);
      this.snackbarService.genericError();
    }
  }

  async resendInvite(userId: number) {
    try {
      const response = await this.usersService.resendInvite(userId);
      if (response.success) {
        const user = this.users.find((u) => u.id === userId);
        this.snackbarService.success(`Invitation email sent to ${user?.email || 'user'}`);
      } else {
        this.snackbarService.genericError();
      }
    } catch (error: any) {
      console.error('Error resending invite:', error);
      if (error?.status === 400) {
        this.snackbarService.error('User is not in pending status');
      } else {
        this.snackbarService.genericError();
      }
    }
  }
}
