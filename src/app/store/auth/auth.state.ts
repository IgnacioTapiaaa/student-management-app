import { User } from '../../core/models/user.interface';

/**
 * Authentication State Interface
 * Manages user authentication state throughout the application
 */
export interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Initial Authentication State
 */
export const initialAuthState: AuthState = {
  currentUser: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};
