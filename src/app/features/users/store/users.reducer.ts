import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { User } from '../../../core/models/user.interface';
import { UsersState } from './users.state';
import * as UsersActions from './users.actions';

/**
 * Entity Adapter for Users
 * Provides normalized CRUD operations
 */
export const adapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user: User) => user.id,
  sortComparer: false // Can add sorting if needed: (a, b) => a.lastName.localeCompare(b.lastName)
});

/**
 * Initial Users State
 */
export const initialUsersState: UsersState = adapter.getInitialState({
  selectedUserId: null,
  loading: false,
  error: null,
  loaded: false
});

/**
 * Users Reducer
 * Handles all users-related state changes using entity adapter
 */
export const usersReducer = createReducer(
  initialUsersState,

  // Load Users Actions
  on(UsersActions.loadUsers, (state): UsersState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UsersActions.loadUsersSuccess, (state, { users }): UsersState =>
    adapter.setAll(users, {
      ...state,
      loading: false,
      loaded: true,
      error: null
    })
  ),

  on(UsersActions.loadUsersFailure, (state, { error }): UsersState => ({
    ...state,
    loading: false,
    error
  })),

  // Add User Actions
  on(UsersActions.addUser, (state): UsersState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UsersActions.addUserSuccess, (state, { user }): UsersState =>
    adapter.addOne(user, {
      ...state,
      loading: false,
      error: null
    })
  ),

  on(UsersActions.addUserFailure, (state, { error }): UsersState => ({
    ...state,
    loading: false,
    error
  })),

  // Update User Actions
  on(UsersActions.updateUser, (state): UsersState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UsersActions.updateUserSuccess, (state, { user }): UsersState =>
    adapter.updateOne(
      { id: user.id, changes: user },
      {
        ...state,
        loading: false,
        error: null
      }
    )
  ),

  on(UsersActions.updateUserFailure, (state, { error }): UsersState => ({
    ...state,
    loading: false,
    error
  })),

  // Delete User Actions
  on(UsersActions.deleteUser, (state): UsersState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(UsersActions.deleteUserSuccess, (state, { id }): UsersState =>
    adapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
      // Clear selection if deleted user was selected
      selectedUserId: state.selectedUserId === id ? null : state.selectedUserId
    })
  ),

  on(UsersActions.deleteUserFailure, (state, { error }): UsersState => ({
    ...state,
    loading: false,
    error
  })),

  // Selection Actions
  on(UsersActions.selectUser, (state, { id }): UsersState => ({
    ...state,
    selectedUserId: id
  })),

  on(UsersActions.clearSelected, (state): UsersState => ({
    ...state,
    selectedUserId: null
  }))
);
