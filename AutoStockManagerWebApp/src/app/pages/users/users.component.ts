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
import {
  UserDialogComponent,
  UserFormData,
} from '../../components/user-dialog/user-dialog.component';

export interface UserTableData {
  id: string;
  firstName: string;
  lastName: string;
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

  displayedColumns: string[] = ['user', 'status', 'actions'];
  dataSource = new MatTableDataSource<UserTableData>();
  searchValue: string = '';
  userDialogVisible = false;

  // Mock users data - in real app, this would come from a service
  private users: UserTableData[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'pending',
      createdAt: new Date('2024-03-10'),
    },
    {
      id: '4',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@example.com',
      role: 'user',
      status: 'disabled',
      createdAt: new Date('2024-01-05'),
    },
  ];

  ngOnInit() {
    this.dataSource.data = this.users;
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

  onUserSubmit(userData: UserFormData) {
    console.log('User added:', userData);
    // Parse name into firstName and lastName
    const nameParts = userData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser: UserTableData = {
      id: String(this.users.length + 1),
      firstName,
      lastName,
      email: userData.email,
      role: userData.role,
      status: 'pending',
      createdAt: new Date(),
    };

    this.users.push(newUser);
    this.dataSource.data = [...this.users];
    this.userDialogVisible = false;
  }

  deleteUser(user: UserTableData) {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.users = this.users.filter((u) => u.id !== user.id);
      this.dataSource.data = [...this.users];
    }
  }

  disableUser(user: UserTableData) {
    const newStatus = user.status === 'disabled' ? 'active' : 'disabled';
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index].status = newStatus;
      this.dataSource.data = [...this.users];
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
