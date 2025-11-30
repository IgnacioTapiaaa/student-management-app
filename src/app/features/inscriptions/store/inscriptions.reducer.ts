import { createReducer, on } from '@ngrx/store';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Inscription } from '../../../core/models/inscription.interface';
import { InscriptionsState, initialInscriptionsState } from './inscriptions.state';
import * as InscriptionsActions from './inscriptions.actions';

/**
 * Entity Adapter for Inscriptions
 * Provides methods for managing normalized state
 */
export const adapter: EntityAdapter<Inscription> = createEntityAdapter<Inscription>({
  selectId: (inscription: Inscription) => inscription.id,
  sortComparer: false
});

/**
 * Initial state with EntityAdapter defaults
 */
export const initialState: InscriptionsState = adapter.getInitialState(initialInscriptionsState);

/**
 * Inscriptions Reducer
 * Handles all inscription-related actions using EntityAdapter
 */
export const inscriptionsReducer = createReducer(
  initialState,

  // Load Inscriptions
  on(InscriptionsActions.loadInscriptions, (state): InscriptionsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InscriptionsActions.loadInscriptionsSuccess, (state, { inscriptions }): InscriptionsState =>
    adapter.setAll(inscriptions, {
      ...state,
      loading: false,
      loaded: true,
      error: null
    })
  ),

  on(InscriptionsActions.loadInscriptionsFailure, (state, { error }): InscriptionsState => ({
    ...state,
    loading: false,
    error
  })),

  // Add Inscription
  on(InscriptionsActions.addInscription, (state): InscriptionsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InscriptionsActions.addInscriptionSuccess, (state, { inscription }): InscriptionsState =>
    adapter.addOne(inscription, {
      ...state,
      loading: false,
      error: null
    })
  ),

  on(InscriptionsActions.addInscriptionFailure, (state, { error }): InscriptionsState => ({
    ...state,
    loading: false,
    error
  })),

  // Update Inscription
  on(InscriptionsActions.updateInscription, (state): InscriptionsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InscriptionsActions.updateInscriptionSuccess, (state, { inscription }): InscriptionsState =>
    adapter.updateOne(
      { id: inscription.id, changes: inscription },
      {
        ...state,
        loading: false,
        error: null
      }
    )
  ),

  on(InscriptionsActions.updateInscriptionFailure, (state, { error }): InscriptionsState => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Inscription
  on(InscriptionsActions.deleteInscription, (state): InscriptionsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InscriptionsActions.deleteInscriptionSuccess, (state, { id }): InscriptionsState =>
    adapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
      selectedInscriptionId: state.selectedInscriptionId === id ? null : state.selectedInscriptionId
    })
  ),

  on(InscriptionsActions.deleteInscriptionFailure, (state, { error }): InscriptionsState => ({
    ...state,
    loading: false,
    error
  })),

  // Cancel Inscription
  on(InscriptionsActions.cancelInscription, (state): InscriptionsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InscriptionsActions.cancelInscriptionSuccess, (state, { inscription }): InscriptionsState =>
    adapter.updateOne(
      { id: inscription.id, changes: { status: 'cancelled' } },
      {
        ...state,
        loading: false,
        error: null
      }
    )
  ),

  on(InscriptionsActions.cancelInscriptionFailure, (state, { error }): InscriptionsState => ({
    ...state,
    loading: false,
    error
  })),

  // Selection
  on(InscriptionsActions.selectInscription, (state, { id }): InscriptionsState => ({
    ...state,
    selectedInscriptionId: id
  })),

  on(InscriptionsActions.clearSelected, (state): InscriptionsState => ({
    ...state,
    selectedInscriptionId: null
  }))
);
