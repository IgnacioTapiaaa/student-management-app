import { createReducer, on } from '@ngrx/store';
import { UiState, initialUiState } from './ui.state';
import * as UiActions from './ui.actions';

/**
 * UI Reducer
 * Handles state changes for UI actions
 */
export const uiReducer = createReducer(
  initialUiState,

  // Toolbar Actions
  on(UiActions.setToolbarTitle, (state, { title }): UiState => ({
    ...state,
    toolbarTitle: title
  })),

  // Sidenav Actions
  on(UiActions.toggleSidenav, (state): UiState => ({
    ...state,
    sidenavOpened: !state.sidenavOpened
  })),

  on(UiActions.setSidenavOpened, (state, { opened }): UiState => ({
    ...state,
    sidenavOpened: opened
  })),

  on(UiActions.openSidenav, (state): UiState => ({
    ...state,
    sidenavOpened: true
  })),

  on(UiActions.closeSidenav, (state): UiState => ({
    ...state,
    sidenavOpened: false
  }))
);
