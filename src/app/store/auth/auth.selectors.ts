import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

/**
 * Authentication Selectors
 * Provides efficient access to auth state slices
 */

// Feature Selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Basic Selectors
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser
);

export const selectToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

// Computed Selectors
export const selectIsAdmin = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'admin'
);

export const selectUserFullName = createSelector(
  selectCurrentUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : ''
);

export const selectUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role || null
);

export const selectHasAuthError = createSelector(
  selectAuthError,
  (error) => error !== null
);
