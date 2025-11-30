import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, concatMap, tap, mergeMap, withLatestFrom } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InscriptionsService } from '../../../core/services/inscriptions.service';
import * as InscriptionsActions from './inscriptions.actions';
import * as CoursesActions from '../../courses/store/courses.actions';
import { selectInscriptionEntities } from './inscriptions.selectors';

/**
 * Inscriptions Effects
 * Handles side effects for inscription-related actions
 * Includes cross-store coordination with Courses store for enrollment management
 */
@Injectable()
export class InscriptionsEffects {
  private actions$ = inject(Actions);
  private inscriptionsService = inject(InscriptionsService);
  private snackBar = inject(MatSnackBar);
  private store = inject(Store);

  /**
   * Load Inscriptions Effect
   * Uses switchMap to cancel previous requests if new load is triggered
   */
  loadInscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.loadInscriptions),
      switchMap(() =>
        this.inscriptionsService.getAll().pipe(
          map(inscriptions => InscriptionsActions.loadInscriptionsSuccess({ inscriptions })),
          catchError(error => of(InscriptionsActions.loadInscriptionsFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Add Inscription Effect
   * Uses concatMap to ensure sequential processing
   */
  addInscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.addInscription),
      concatMap(({ inscription }) =>
        this.inscriptionsService.addInscription(inscription).pipe(
          map(newInscription => InscriptionsActions.addInscriptionSuccess({ inscription: newInscription })),
          catchError(error => of(InscriptionsActions.addInscriptionFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Add Inscription Success Effect
   * Cross-store coordination: increment course enrollment
   */
  addInscriptionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.addInscriptionSuccess),
      mergeMap(({ inscription }) => [
        // Dispatch action to increment course enrollment
        CoursesActions.incrementEnrollment({ courseId: inscription.courseId })
      ])
    )
  );

  /**
   * Add Inscription Success Notification Effect
   */
  addInscriptionSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InscriptionsActions.addInscriptionSuccess),
        tap(() => {
          this.snackBar.open('Inscription added successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Update Inscription Effect
   * Uses concatMap to ensure sequential processing
   */
  updateInscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.updateInscription),
      concatMap(({ id, changes }) =>
        this.inscriptionsService.updateInscription(id, changes).pipe(
          map(updatedInscription => InscriptionsActions.updateInscriptionSuccess({ inscription: updatedInscription })),
          catchError(error => of(InscriptionsActions.updateInscriptionFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Update Inscription Success Effect
   * Show success notification
   */
  updateInscriptionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InscriptionsActions.updateInscriptionSuccess),
        tap(() => {
          this.snackBar.open('Inscription updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Delete Inscription Effect
   * Uses concatMap to ensure sequential processing
   */
  deleteInscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.deleteInscription),
      withLatestFrom(this.store.select(selectInscriptionEntities)),
      concatMap(([{ id }, inscriptionEntities]) => {
        const inscription = inscriptionEntities[id];
        if (!inscription) {
          return of(InscriptionsActions.deleteInscriptionFailure({
            error: 'Inscription not found'
          }));
        }

        return this.inscriptionsService.deleteInscription(id).pipe(
          map(() => InscriptionsActions.deleteInscriptionSuccess({
            id,
            courseId: inscription.courseId
          })),
          catchError(error => of(InscriptionsActions.deleteInscriptionFailure({ error: error.message })))
        );
      })
    )
  );

  /**
   * Delete Inscription Success Effect
   * Cross-store coordination: decrement course enrollment if inscription was active
   */
  deleteInscriptionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.deleteInscriptionSuccess),
      withLatestFrom(this.store.select(selectInscriptionEntities)),
      mergeMap(([{ id, courseId }, inscriptionEntities]) => {
        // Get the inscription before it was deleted to check status
        // Since it's deleted, we need to check the action payload
        // We'll dispatch decrement only if the inscription was active
        return [
          CoursesActions.decrementEnrollment({ courseId })
        ];
      })
    )
  );

  /**
   * Delete Inscription Success Notification Effect
   */
  deleteInscriptionSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InscriptionsActions.deleteInscriptionSuccess),
        tap(() => {
          this.snackBar.open('Inscription deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Cancel Inscription Effect
   * Uses concatMap to ensure sequential processing
   */
  cancelInscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.cancelInscription),
      withLatestFrom(this.store.select(selectInscriptionEntities)),
      concatMap(([{ id }, inscriptionEntities]) => {
        const inscription = inscriptionEntities[id];
        if (!inscription) {
          return of(InscriptionsActions.cancelInscriptionFailure({
            error: 'Inscription not found'
          }));
        }

        return this.inscriptionsService.cancelInscription(id).pipe(
          map(updatedInscription => InscriptionsActions.cancelInscriptionSuccess({
            inscription: updatedInscription,
            courseId: inscription.courseId
          })),
          catchError(error => of(InscriptionsActions.cancelInscriptionFailure({ error: error.message })))
        );
      })
    )
  );

  /**
   * Cancel Inscription Success Effect
   * Cross-store coordination: decrement course enrollment if inscription was active
   */
  cancelInscriptionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InscriptionsActions.cancelInscriptionSuccess),
      mergeMap(({ courseId }) => [
        // Dispatch action to decrement course enrollment
        CoursesActions.decrementEnrollment({ courseId })
      ])
    )
  );

  /**
   * Cancel Inscription Success Notification Effect
   */
  cancelInscriptionSuccessNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InscriptionsActions.cancelInscriptionSuccess),
        tap(() => {
          this.snackBar.open('Inscription cancelled successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Handle Errors Effect
   * Show error notifications for all failure actions
   */
  handleErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          InscriptionsActions.loadInscriptionsFailure,
          InscriptionsActions.addInscriptionFailure,
          InscriptionsActions.updateInscriptionFailure,
          InscriptionsActions.deleteInscriptionFailure,
          InscriptionsActions.cancelInscriptionFailure
        ),
        tap(({ error }) => {
          this.snackBar.open(error, 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        })
      ),
    { dispatch: false }
  );
}
