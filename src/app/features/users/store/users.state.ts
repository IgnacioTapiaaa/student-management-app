import { EntityState } from '@ngrx/entity';
import { User } from '../../../core/models/user.interface';

/**
 * Users Feature State
 * Uses @ngrx/entity for normalized state management
 */
export interface UsersState extends EntityState<User> {
  // EntityState provides: entities: Dictionary<User>, ids: string[]
  selectedUserId: number | null;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}
