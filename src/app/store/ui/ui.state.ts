/**
 * UI State Interface
 * Manages UI-related state throughout the application
 */
export interface UiState {
  toolbarTitle: string;
  sidenavOpened: boolean;
}

/**
 * Initial UI State
 */
export const initialUiState: UiState = {
  toolbarTitle: 'Student Management System',
  sidenavOpened: true
};
