import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService } from '../../core/services/users.service';
import { User, CreateUser } from '../../core/models/user.interface';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { ConfirmDialogComponent } from '../students/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
    UserFormComponent,
    UserListComponent,
    UserStatsComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals for form state
  isEditMode = signal(false);
  editingUser = signal<User | undefined>(undefined);

  // Service signals
  users = this.usersService.users;
  totalUsers = this.usersService.totalUsers;
  adminUsers = this.usersService.adminUsers;
  regularUsers = this.usersService.regularUsers;

  // Computed signals for form
  formTitle = computed(() =>
    this.isEditMode() ? 'Edit User' : 'Add New User'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update User' : 'Add User'
  );

  onUserSubmit(userData: CreateUser): void {
    if (this.isEditMode() && this.editingUser()) {
      const userId = this.editingUser()!.id;
      this.usersService.updateUser(userId, userData).subscribe({
        next: (updatedUser) => {
          console.log('[UsersComponent] User updated:', updatedUser);
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.cancelEdit();
        },
        error: (error) => {
          console.error('[UsersComponent] Update error:', error);
          this.snackBar.open('Failed to update user', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Check if email already exists
      if (this.usersService.emailExists(userData.email)) {
        this.snackBar.open('Email already exists!', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.usersService.addUser(userData).subscribe({
        next: (newUser) => {
          console.log('[UsersComponent] User added:', newUser);
          this.snackBar.open('User added successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('[UsersComponent] Add error:', error);
          this.snackBar.open('Failed to add user', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  onFormCancel(): void {
    this.cancelEdit();
  }

  onEditUser(user: User): void {
    this.isEditMode.set(true);
    this.editingUser.set(user);
  }

  onDeleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.firstName} ${user.lastName}" (${user.email})? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });

            // If deleting the user being edited, cancel edit mode
            if (this.editingUser()?.id === user.id) {
              this.cancelEdit();
            }
          },
          error: (error) => {
            console.error('[UsersComponent] Delete error:', error);
            this.snackBar.open('Failed to delete user', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  private cancelEdit(): void {
    this.isEditMode.set(false);
    this.editingUser.set(undefined);
  }
}
