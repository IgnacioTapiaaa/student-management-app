import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, concatMap } from 'rxjs/operators';
import { StudentsService } from '../../../core/services/students.service';
import * as StudentsActions from './students.actions';

/**
 * Students Effects
 * Handles side effects for students actions (API calls, navigation, notifications)
 */
@Injectable()
export class StudentsEffects {
  private actions$ = inject(Actions);
  private studentsService = inject(StudentsService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  /**
   * Load Students Effect
   * Triggered when: [Students Page] Load Students
   * Calls API and dispatches success/failure
   */
  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.loadStudents),
      switchMap(() =>
        this.studentsService.getAll().pipe(
          map(students => StudentsActions.loadStudentsSuccess({ students })),
          catchError(error => of(StudentsActions.loadStudentsFailure({
            error: error.message || 'Failed to load students'
          })))
        )
      )
    )
  );

  /**
   * Add Student Effect
   * Triggered when: [Students Page] Add Student
   * Uses concatMap to ensure sequential execution
   */
  addStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.addStudent),
      concatMap(({ student }) =>
        this.studentsService.addStudent(student).pipe(
          map(newStudent => StudentsActions.addStudentSuccess({ student: newStudent })),
          catchError(error => of(StudentsActions.addStudentFailure({
            error: error.message || 'Failed to add student'
          })))
        )
      )
    )
  );

  /**
   * Add Student Success Effect
   * Shows success notification
   */
  addStudentSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(StudentsActions.addStudentSuccess),
        tap(() => {
          this.snackBar.open('Student added successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Update Student Effect
   * Triggered when: [Students Page] Update Student
   */
  updateStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.updateStudent),
      concatMap(({ id, changes }) =>
        this.studentsService.updateStudent(id, changes).pipe(
          map(updatedStudent => StudentsActions.updateStudentSuccess({ student: updatedStudent })),
          catchError(error => of(StudentsActions.updateStudentFailure({
            error: error.message || 'Failed to update student'
          })))
        )
      )
    )
  );

  /**
   * Update Student Success Effect
   * Shows success notification
   */
  updateStudentSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(StudentsActions.updateStudentSuccess),
        tap(() => {
          this.snackBar.open('Student updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Delete Student Effect
   * Triggered when: [Students Page] Delete Student
   */
  deleteStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.deleteStudent),
      concatMap(({ id }) =>
        this.studentsService.deleteStudent(id).pipe(
          map(() => StudentsActions.deleteStudentSuccess({ id })),
          catchError(error => of(StudentsActions.deleteStudentFailure({
            error: error.message || 'Failed to delete student'
          })))
        )
      )
    )
  );

  /**
   * Delete Student Success Effect
   * Shows success notification
   */
  deleteStudentSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(StudentsActions.deleteStudentSuccess),
        tap(() => {
          this.snackBar.open('Student deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Error Handling Effect
   * Shows error notifications for all failure actions
   */
  handleErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          StudentsActions.loadStudentsFailure,
          StudentsActions.addStudentFailure,
          StudentsActions.updateStudentFailure,
          StudentsActions.deleteStudentFailure
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
