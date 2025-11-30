import { createAction, props } from '@ngrx/store';
import { User, LoginCredentials } from '../../core/models/user.interface';

/**
 * Authentication Actions
 * Defines all actions related to user authentication
 */

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Load User from Storage Actions
export const loadUserFromStorage = createAction('[Auth] Load User From Storage');

export const loadUserSuccess = createAction(
  '[Auth] Load User Success',
  props<{ user: User; token: string }>()
);

export const loadUserFailure = createAction('[Auth] Load User Failure');

// Clear Error Action
export const clearAuthError = createAction('[Auth] Clear Error');
