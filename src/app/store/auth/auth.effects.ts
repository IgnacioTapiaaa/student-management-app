import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { User } from '../../core/models/user.interface';

/**
 * Authentication Effects
 * Handles side effects for authentication actions
 */
@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Hardcoded users for testing (same as auth.service.ts)
  private readonly MOCK_USERS: User[] = [
    {
      id: 1,
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    {
      id: 2,
      email: 'user@test.com',
      password: 'user123',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user'
    }
  ];

  /**
   * Login Effect
   * Handles user login by validating credentials and generating token
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      map(action => {
        const user = this.MOCK_USERS.find(
          u => u.email === action.credentials.email &&
               u.password === action.credentials.password
        );

        if (user) {
          // Create a user object without password for storage
          const { password, ...userWithoutPassword } = user;
          const safeUser = { ...userWithoutPassword, password: '' };

          // Generate mock token
          const token = this.generateMockToken(user);

          // Store in localStorage
          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));

          return AuthActions.loginSuccess({ user: safeUser as User, token });
        } else {
          return AuthActions.loginFailure({ error: 'Invalid email or password' });
        }
      }),
      catchError(error => of(AuthActions.loginFailure({
        error: error.message || 'Login failed'
      })))
    )
  );

  /**
   * Login Success Effect
   * Navigates to students page after successful login
   */
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/students']);
        })
      ),
    { dispatch: false }
  );

  /**
   * Logout Effect
   * Clears localStorage and navigates to login
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.router.navigate(['/login']);
      }),
      map(() => AuthActions.logoutSuccess())
    )
  );

  /**
   * Load User from Storage Effect
   * Attempts to restore user session from localStorage on app init
   */
  loadUserFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromStorage),
      switchMap(() => {
        const userJson = localStorage.getItem(this.USER_KEY);
        const token = localStorage.getItem(this.TOKEN_KEY);

        if (userJson && token) {
          try {
            const user = JSON.parse(userJson) as User;
            return of(AuthActions.loadUserSuccess({ user, token }));
          } catch (error) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
            return of(AuthActions.loadUserFailure());
          }
        }

        return of(AuthActions.loadUserFailure());
      })
    )
  );

  /**
   * Generate mock JWT-like token (for demonstration purposes)
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 86400000 // 24 hours
    }));
    const signature = btoa(`mock-signature-${user.id}`);

    return `${header}.${payload}.${signature}`;
  }
}
