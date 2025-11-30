import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.state';
import { adapter } from './users.reducer';

/**
 * Users Selectors
 * Provides efficient memoized access to users state
 */

// Feature Selector
export const selectUsersState = createFeatureSelector<UsersState>('users');

// Entity Adapter Selectors
// These provide: selectIds, selectEntities, selectAll, selectTotal
const {
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectAll: selectAllUsers,
  selectTotal: selectTotalUsersCount
} = adapter.getSelectors(selectUsersState);

// Export entity selectors
export { selectUserIds, selectUserEntities, selectAllUsers, selectTotalUsersCount };

// Custom Selectors - Loading & Error States
export const selectUsersLoading = createSelector(
  selectUsersState,
  (state: UsersState) => state.loading
);

export const selectUsersError = createSelector(
  selectUsersState,
  (state: UsersState) => state.error
);

export const selectUsersLoaded = createSelector(
  selectUsersState,
  (state: UsersState) => state.loaded
);

// Selection Selectors
export const selectSelectedUserId = createSelector(
  selectUsersState,
  (state: UsersState) => state.selectedUserId
);

export const selectSelectedUser = createSelector(
  selectUserEntities,
  selectSelectedUserId,
  (entities, selectedId) => selectedId !== null ? entities[selectedId] : null
);

// Factory Selector - Get User by ID
export const selectUserById = (id: number) => createSelector(
  selectUserEntities,
  (entities) => entities[id]
);

// Computed Selectors - Filter by Role
export const selectAdmins = createSelector(
  selectAllUsers,
  (users) => users.filter(user => user.role === 'admin')
);

export const selectRegularUsers = createSelector(
  selectAllUsers,
  (users) => users.filter(user => user.role === 'user')
);

// Computed Selectors - Statistics
export const selectTotalUsers = createSelector(
  selectAllUsers,
  (users) => users.length
);

export const selectAdminCount = createSelector(
  selectAdmins,
  (admins) => admins.length
);

export const selectUserCount = createSelector(
  selectRegularUsers,
  (regularUsers) => regularUsers.length
);

// Search/Filter Selectors
export const selectUsersBySearchTerm = (searchTerm: string) => createSelector(
  selectAllUsers,
  (users) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return users;
    }
    const term = searchTerm.toLowerCase().trim();
    return users.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }
);

// View Model Selector - Combines multiple state slices for UI
export const selectUsersViewModel = createSelector(
  selectAllUsers,
  selectUsersLoading,
  selectUsersError,
  selectTotalUsers,
  selectAdminCount,
  selectUserCount,
  (users, loading, error, total, adminCount, userCount) => ({
    users,
    loading,
    error,
    total,
    adminCount,
    userCount
  })
);
