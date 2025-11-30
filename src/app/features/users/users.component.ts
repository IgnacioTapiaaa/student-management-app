import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { User, CreateUser } from '../../core/models/user.interface';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';
import { ConfirmDialogComponent } from '../students/confirm-dialog.component';
import * as UsersActions from './store/users.actions';
import * as UsersSelectors from './store/users.selectors';

/**
 * Users Component
 * Main container component for users management
 * Uses NGRX Store for state management
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    UserFormComponent,
    UserListComponent,
    UserStatsComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  // Local UI state
  isEditMode = signal<boolean>(false);
  editingUser = signal<User | undefined>(undefined);

  // Store selectors - Observable streams
  users$ = this.store.select(UsersSelectors.selectAllUsers);
  loading$ = this.store.select(UsersSelectors.selectUsersLoading);
  error$ = this.store.select(UsersSelectors.selectUsersError);
  totalUsers$ = this.store.select(UsersSelectors.selectTotalUsers);
  adminUsers$ = this.store.select(UsersSelectors.selectAdminCount);
  regularUsers$ = this.store.select(UsersSelectors.selectUserCount);

  // View model - combines multiple selectors
  viewModel$ = this.store.select(UsersSelectors.selectUsersViewModel);

  // Computed signals for form
  formTitle = computed(() =>
    this.isEditMode() ? 'Edit User' : 'Add New User'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update User' : 'Add User'
  );

  ngOnInit(): void {
    // Dispatch action to load users
    this.store.dispatch(UsersActions.loadUsers());
  }

  onUserSubmit(userData: CreateUser): void {
    if (this.isEditMode() && this.editingUser()) {
      const userId = this.editingUser()!.id;
      this.store.dispatch(UsersActions.updateUser({
        id: userId,
        changes: userData
      }));
    } else {
      this.store.dispatch(UsersActions.addUser({
        user: userData
      }));
    }

    this.resetEditMode();
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditUser(user: User): void {
    this.isEditMode.set(true);
    this.editingUser.set(user);
    this.store.dispatch(UsersActions.selectUser({ id: user.id }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      if (result === true) {
        this.store.dispatch(UsersActions.deleteUser({ id: user.id }));

        // Reset edit mode if deleting the currently editing user
        if (this.editingUser()?.id === user.id) {
          this.resetEditMode();
        }
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingUser.set(undefined);
    this.store.dispatch(UsersActions.clearSelected());
  }
}
