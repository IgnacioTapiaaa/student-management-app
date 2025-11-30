import { createAction, props } from '@ngrx/store';
import { Inscription, CreateInscription, UpdateInscription } from '../../../core/models/inscription.interface';

/**
 * Inscriptions Actions
 * Following the [Source] Action Description naming convention
 */

// Load Actions
export const loadInscriptions = createAction(
  '[Inscriptions Page] Load Inscriptions'
);

export const loadInscriptionsSuccess = createAction(
  '[Inscriptions API] Load Inscriptions Success',
  props<{ inscriptions: Inscription[] }>()
);

export const loadInscriptionsFailure = createAction(
  '[Inscriptions API] Load Inscriptions Failure',
  props<{ error: string }>()
);

// Add Actions
export const addInscription = createAction(
  '[Inscriptions Page] Add Inscription',
  props<{ inscription: CreateInscription }>()
);

export const addInscriptionSuccess = createAction(
  '[Inscriptions API] Add Inscription Success',
  props<{ inscription: Inscription }>()
);

export const addInscriptionFailure = createAction(
  '[Inscriptions API] Add Inscription Failure',
  props<{ error: string }>()
);

// Update Actions
export const updateInscription = createAction(
  '[Inscriptions Page] Update Inscription',
  props<{ id: number; changes: UpdateInscription }>()
);

export const updateInscriptionSuccess = createAction(
  '[Inscriptions API] Update Inscription Success',
  props<{ inscription: Inscription }>()
);

export const updateInscriptionFailure = createAction(
  '[Inscriptions API] Update Inscription Failure',
  props<{ error: string }>()
);

// Delete Actions
export const deleteInscription = createAction(
  '[Inscriptions Page] Delete Inscription',
  props<{ id: number }>()
);

export const deleteInscriptionSuccess = createAction(
  '[Inscriptions API] Delete Inscription Success',
  props<{ id: number; courseId: number }>()
);

export const deleteInscriptionFailure = createAction(
  '[Inscriptions API] Delete Inscription Failure',
  props<{ error: string }>()
);

// Cancel Actions
export const cancelInscription = createAction(
  '[Inscriptions Page] Cancel Inscription',
  props<{ id: number }>()
);

export const cancelInscriptionSuccess = createAction(
  '[Inscriptions API] Cancel Inscription Success',
  props<{ inscription: Inscription; courseId: number }>()
);

export const cancelInscriptionFailure = createAction(
  '[Inscriptions API] Cancel Inscription Failure',
  props<{ error: string }>()
);

// Selection Actions
export const selectInscription = createAction(
  '[Inscriptions Page] Select Inscription',
  props<{ id: number }>()
);

export const clearSelected = createAction(
  '[Inscriptions Page] Clear Selected'
);
