import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.state';

/**
 * UI Selectors
 * Provides efficient access to UI state slices
 */

// Feature Selector
export const selectUiState = createFeatureSelector<UiState>('ui');

// Basic Selectors
export const selectToolbarTitle = createSelector(
  selectUiState,
  (state: UiState) => state.toolbarTitle
);

export const selectSidenavOpened = createSelector(
  selectUiState,
  (state: UiState) => state.sidenavOpened
);
