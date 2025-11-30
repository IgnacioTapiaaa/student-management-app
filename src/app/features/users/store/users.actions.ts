import { createAction, props } from '@ngrx/store';
import { User, CreateUser } from '../../../core/models/user.interface';

/**
 * Users Actions
 * Following naming convention: [Source] Action Description
 * Sources: [Users Page] for UI actions, [Users API] for API responses
 */

// Load Users Actions
export const loadUsers = createAction('[Users Page] Load Users');

export const loadUsersSuccess = createAction(
  '[Users API] Load Users Success',
  props<{ users: User[] }>()
);

export const loadUsersFailure = createAction(
  '[Users API] Load Users Failure',
  props<{ error: string }>()
);

// Add User Actions
export const addUser = createAction(
  '[Users Page] Add User',
  props<{ user: CreateUser }>()
);

export const addUserSuccess = createAction(
  '[Users API] Add User Success',
  props<{ user: User }>()
);

export const addUserFailure = createAction(
  '[Users API] Add User Failure',
  props<{ error: string }>()
);

// Update User Actions
export const updateUser = createAction(
  '[Users Page] Update User',
  props<{ id: number; changes: Partial<CreateUser> }>()
);

export const updateUserSuccess = createAction(
  '[Users API] Update User Success',
  props<{ user: User }>()
);

export const updateUserFailure = createAction(
  '[Users API] Update User Failure',
  props<{ error: string }>()
);

// Delete User Actions
export const deleteUser = createAction(
  '[Users Page] Delete User',
  props<{ id: number }>()
);

export const deleteUserSuccess = createAction(
  '[Users API] Delete User Success',
  props<{ id: number }>()
);

export const deleteUserFailure = createAction(
  '[Users API] Delete User Failure',
  props<{ error: string }>()
);

// Selection Actions
export const selectUser = createAction(
  '[Users Page] Select User',
  props<{ id: number }>()
);

export const clearSelected = createAction('[Users Page] Clear Selected');
