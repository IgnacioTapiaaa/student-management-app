import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { User, LoginCredentials } from '../models/user.interface';
import { AppState } from '../../store/app.state';
import * as AuthActions from '../../store/auth/auth.actions';
import * as AuthSelectors from '../../store/auth/auth.selectors';

/**
 * Authentication Service
 * Manages user authentication using NGRX Store
 * Maintains backward compatibility with signal-based API for existing components
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private store = inject(Store<AppState>);
  private router = inject(Router);

  // NGRX Store Observables - Primary API for new components
  public readonly currentUser$: Observable<User | null> = this.store.select(AuthSelectors.selectCurrentUser);
  public readonly token$: Observable<string | null> = this.store.select(AuthSelectors.selectToken);
  public readonly isAuthenticated$: Observable<boolean> = this.store.select(AuthSelectors.selectIsAuthenticated);
  public readonly isAdmin$: Observable<boolean> = this.store.select(AuthSelectors.selectIsAdmin);
  public readonly userFullName$: Observable<string> = this.store.select(AuthSelectors.selectUserFullName);
  public readonly loading$: Observable<boolean> = this.store.select(AuthSelectors.selectAuthLoading);
  public readonly error$: Observable<string | null> = this.store.select(AuthSelectors.selectAuthError);

  // Signal-based API - Backward compatibility for existing components
  // These signals are derived from store selectors
  private currentUserSignal = toSignal(this.currentUser$, { initialValue: null });

  public readonly currentUser = computed(() => this.currentUserSignal());
  public readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  public readonly userFullName = computed(() => {
    const user = this.currentUserSignal();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  constructor() {
    // Load user from storage on service initialization
    this.store.dispatch(AuthActions.loadUserFromStorage());
  }

  /**
   * Authenticate user with email and password
   * Dispatches login action to NGRX store
   */
  login(credentials: LoginCredentials): { success: boolean; message: string } {
    // Dispatch login action to store
    // The effect will handle the actual authentication logic
    this.store.dispatch(AuthActions.login({ credentials }));

    // Return a synchronous response for backward compatibility
    // The actual result will be handled by the store
    return {
      success: true,
      message: 'Login in progress...'
    };
  }

  /**
   * Logout user and clear storage
   * Dispatches logout action to NGRX store
   */
  logout(): void {
    // Dispatch logout action to store
    // The effect will handle clearing localStorage and navigation
    this.store.dispatch(AuthActions.logout());
  }

  /**
   * Get stored auth token
   * For backward compatibility - reads directly from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   * For backward compatibility
   */
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Check if current user has admin role
   * For backward compatibility
   */
  hasAdminRole(): boolean {
    return this.isAdmin();
  }

  /**
   * Clear auth error from store
   */
  clearError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }

  /**
   * Manually trigger load user from storage
   */
  loadUserFromStorage(): void {
    this.store.dispatch(AuthActions.loadUserFromStorage());
  }
}
