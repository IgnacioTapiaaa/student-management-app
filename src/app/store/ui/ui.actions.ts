import { createAction, props } from '@ngrx/store';

/**
 * UI Actions
 * Defines all actions related to UI state management
 */

// Toolbar Actions
export const setToolbarTitle = createAction(
  '[UI] Set Toolbar Title',
  props<{ title: string }>()
);

// Sidenav Actions
export const toggleSidenav = createAction('[UI] Toggle Sidenav');

export const setSidenavOpened = createAction(
  '[UI] Set Sidenav Opened',
  props<{ opened: boolean }>()
);

export const openSidenav = createAction('[UI] Open Sidenav');

export const closeSidenav = createAction('[UI] Close Sidenav');
