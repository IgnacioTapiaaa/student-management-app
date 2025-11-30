import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, concatMap } from 'rxjs/operators';
import { UsersService } from '../../../core/services/users.service';
import * as UsersActions from './users.actions';

/**
 * Users Effects
 * Handles side effects for users actions (API calls, navigation, notifications)
 */
@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  /**
   * Load Users Effect
   * Triggered when: [Users Page] Load Users
   * Calls API and dispatches success/failure
   */
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(() =>
        this.usersService.getAll().pipe(
          map(users => UsersActions.loadUsersSuccess({ users })),
          catchError(error => of(UsersActions.loadUsersFailure({
            error: error.message || 'Failed to load users'
          })))
        )
      )
    )
  );

  /**
   * Add User Effect
   * Triggered when: [Users Page] Add User
   * Uses concatMap to ensure sequential execution
   */
  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.addUser),
      concatMap(({ user }) =>
        this.usersService.addUser(user).pipe(
          map(newUser => UsersActions.addUserSuccess({ user: newUser })),
          catchError(error => of(UsersActions.addUserFailure({
            error: error.message || 'Failed to add user'
          })))
        )
      )
    )
  );

  /**
   * Add User Success Effect
   * Shows success notification
   */
  addUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.addUserSuccess),
        tap(() => {
          this.snackBar.open('User added successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Update User Effect
   * Triggered when: [Users Page] Update User
   */
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      concatMap(({ id, changes }) =>
        this.usersService.updateUser(id, changes).pipe(
          map(updatedUser => UsersActions.updateUserSuccess({ user: updatedUser })),
          catchError(error => of(UsersActions.updateUserFailure({
            error: error.message || 'Failed to update user'
          })))
        )
      )
    )
  );

  /**
   * Update User Success Effect
   * Shows success notification
   */
  updateUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.updateUserSuccess),
        tap(() => {
          this.snackBar.open('User updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Delete User Effect
   * Triggered when: [Users Page] Delete User
   */
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUser),
      concatMap(({ id }) =>
        this.usersService.deleteUser(id).pipe(
          map(() => UsersActions.deleteUserSuccess({ id })),
          catchError(error => of(UsersActions.deleteUserFailure({
            error: error.message || 'Failed to delete user'
          })))
        )
      )
    )
  );

  /**
   * Delete User Success Effect
   * Shows success notification
   */
  deleteUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.deleteUserSuccess),
        tap(() => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Error Handling Effect
   * Shows error notifications for all failure actions
   */
  handleErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UsersActions.loadUsersFailure,
          UsersActions.addUserFailure,
          UsersActions.updateUserFailure,
          UsersActions.deleteUserFailure
        ),
        tap(({ error }) => {
          this.snackBar.open(error, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        })
      ),
    { dispatch: false }
  );
}
