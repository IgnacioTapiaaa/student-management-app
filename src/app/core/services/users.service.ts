import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, CreateUser, UserRole } from '../models/user.interface';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  // Writable signal for manual updates after mutations
  private usersWritableSignal = signal<User[]>([]);

  // Public readonly signal
  public readonly users = computed(() => this.usersWritableSignal());

  // Computed signals for stats
  public readonly totalUsers = computed(() => this.users().length);
  public readonly adminUsers = computed(() =>
    this.users().filter(u => u.role === 'admin').length
  );
  public readonly regularUsers = computed(() =>
    this.users().filter(u => u.role === 'user').length
  );

  constructor() {
    // Load initial data
    this.loadUsers();
  }

  /**
   * Load all users from API
   */
  private loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (users) => {
        this.usersWritableSignal.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.usersWritableSignal.set([]);
      }
    });
  }

  /**
   * Refresh users data from API
   */
  refreshUsers(): void {
    this.loadUsers();
  }

  /**
   * Add a new user via API
   */
  addUser(user: CreateUser): Observable<User> {
    console.log('[UsersService] addUser called with:', user);

    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(newUser => {
        console.log('[UsersService] User created:', newUser);
        // Update local signal
        this.usersWritableSignal.update(users => [...users, newUser]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing user via API
   */
  updateUser(id: number, changes: Partial<CreateUser>): Observable<User> {
    console.log('[UsersService] updateUser called with ID:', id, 'Changes:', changes);

    const url = `${this.apiUrl}/${id}`;
    return this.http.put<User>(url, changes).pipe(
      tap(updatedUser => {
        console.log('[UsersService] User updated:', updatedUser);
        // Update local signal
        this.usersWritableSignal.update(users =>
          users.map(user =>
            user.id === id ? { ...user, ...updatedUser } : user
          )
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a user via API
   */
  deleteUser(id: number): Observable<void> {
    console.log('[UsersService] deleteUser called with ID:', id);

    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log('[UsersService] User deleted');
        // Update local signal
        this.usersWritableSignal.update(users =>
          users.filter(user => user.id !== id)
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a user by ID (from local signal)
   */
  getUserById(id: number): User | undefined {
    return this.users().find(user => user.id === id);
  }

  /**
   * Search users by email or name (from local signal)
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
   */
  getUsersByRole(role: UserRole): User[] {
    return this.users().filter(user => user.role === role);
  }

  /**
   * Check if email already exists (for validation, from local signal)
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

    console.error('[UsersService] HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
