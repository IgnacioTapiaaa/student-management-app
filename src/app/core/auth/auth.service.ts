import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginCredentials } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Hardcoded users for testing
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

  // Signal for current user
  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());

  // Public readonly signal
  public readonly currentUser = this.currentUserSignal.asReadonly();

  // Computed signals
  public readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  public readonly userFullName = computed(() => {
    const user = this.currentUserSignal();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  constructor(private router: Router) {}

  /**
   * Authenticate user with email and password
   */
  login(credentials: LoginCredentials): { success: boolean; message: string } {
    const user = this.MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      // Create a user object without password for storage
      const { password, ...userWithoutPassword } = user;
      const safeUser = { ...userWithoutPassword, password: '' };

      // Generate mock token (in real app, this would come from backend)
      const token = this.generateMockToken(user);

      // Store in localStorage
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser));

      // Update signal
      this.currentUserSignal.set(safeUser as User);

      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid email or password' };
  }

  /**
   * Logout user and clear storage
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Check if current user has admin role
   */
  hasAdminRole(): boolean {
    return this.isAdmin();
  }

  /**
   * Load user from localStorage on service initialization
   */
  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (userJson && token) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearStorage();
      }
    }

    return null;
  }

  /**
   * Clear all auth data from storage
   */
  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

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
