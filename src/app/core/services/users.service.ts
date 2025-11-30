import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { User, CreateUser, UserRole } from '../models/user.interface';
import { environment } from '../../../environments/environment';
import * as UsersSelectors from '../../features/users/store/users.selectors';

/**
 * Users Service
 * Handles HTTP operations for users
 * Provides backward compatibility with signal-based API via NGRX Store
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private apiUrl = `${environment.apiUrl}/users`;

  // Store Observables
  private users$ = this.store.select(UsersSelectors.selectAllUsers);
  private admins$ = this.store.select(UsersSelectors.selectAdmins);
  private regularUsers$ = this.store.select(UsersSelectors.selectRegularUsers);

  // Backward compatibility - Signal-based API
  private usersSignal = toSignal(this.users$, { initialValue: [] });
  private adminsSignal = toSignal(this.admins$, { initialValue: [] });
  private regularUsersSignal = toSignal(this.regularUsers$, { initialValue: [] });

  public readonly users = computed(() => this.usersSignal());
  public readonly totalUsers = computed(() => this.users().length);
  public readonly adminUsers = computed(() => this.adminsSignal().length);
  public readonly regularUsers = computed(() => this.regularUsersSignal().length);

  /**
   * Get all users from API
   */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a user by ID from API
   */
  getById(id: number): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add a new user via API
   */
  addUser(user: CreateUser): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing user via API
   */
  updateUser(id: number, changes: Partial<CreateUser>): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<User>(url, changes).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a user via API
   */
  deleteUser(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a user by ID (from local signal)
   * For backward compatibility
   */
  getUserById(id: number): User | undefined {
    return this.users().find(user => user.id === id);
  }

  /**
   * Search users by email or name (from local signal)
   * For backward compatibility
   */
  searchUsers(searchTerm: string): User[] {
    if (!searchTerm.trim()) {
      return this.users();
    }

    const term = searchTerm.toLowerCase();
    return this.users().filter(user =>
      user.email.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term)
    );
  }

  /**
   * Get users by role (from local signal)
   * For backward compatibility
   */
  getUsersByRole(role: UserRole): User[] {
    return this.users().filter(user => user.role === role);
  }

  /**
   * Check if email already exists (for validation, from local signal)
   * For backward compatibility
   */
  emailExists(email: string, excludeId?: number): boolean {
    return this.users().some(user =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.id !== excludeId
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
