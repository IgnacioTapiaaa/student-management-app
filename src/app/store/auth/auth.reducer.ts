import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

/**
 * Authentication Reducer
 * Handles state changes for authentication actions
 */
export const authReducer = createReducer(
  initialAuthState,

  // Login Actions
  on(AuthActions.login, (state): AuthState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token }): AuthState => ({
    ...state,
    currentUser: user,
    token,
    isAuthenticated: true,
    loading: false,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    currentUser: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error
  })),

  // Logout Actions
  on(AuthActions.logout, (state): AuthState => ({
    ...state,
    loading: true
  })),

  on(AuthActions.logoutSuccess, (): AuthState => ({
    ...initialAuthState
  })),

  // Load User from Storage Actions
  on(AuthActions.loadUserFromStorage, (state): AuthState => ({
    ...state,
    loading: true
  })),

  on(AuthActions.loadUserSuccess, (state, { user, token }): AuthState => ({
    ...state,
    currentUser: user,
    token,
    isAuthenticated: true,
    loading: false,
    error: null
  })),

  on(AuthActions.loadUserFailure, (state): AuthState => ({
    ...initialAuthState,
    loading: false
  })),

  // Clear Error Action
  on(AuthActions.clearAuthError, (state): AuthState => ({
    ...state,
    error: null
  }))
);
