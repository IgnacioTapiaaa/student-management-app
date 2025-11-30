import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, concatMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoursesService } from '../../../core/services/courses.service';
import * as CoursesActions from './courses.actions';

/**
 * Courses Effects
 * Handles side effects for course-related actions
 */
@Injectable()
export class CoursesEffects {
  private actions$ = inject(Actions);
  private coursesService = inject(CoursesService);
  private snackBar = inject(MatSnackBar);

  /**
   * Load Courses Effect
   * Uses switchMap to cancel previous requests if new load is triggered
   */
  loadCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursesActions.loadCourses),
      switchMap(() =>
        this.coursesService.getAll().pipe(
          map(courses => CoursesActions.loadCoursesSuccess({ courses })),
          catchError(error => of(CoursesActions.loadCoursesFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Add Course Effect
   * Uses concatMap to ensure sequential processing
   */
  addCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursesActions.addCourse),
      concatMap(({ course }) =>
        this.coursesService.addCourse(course).pipe(
          map(newCourse => CoursesActions.addCourseSuccess({ course: newCourse })),
          catchError(error => of(CoursesActions.addCourseFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Add Course Success Effect
   * Show success notification
   */
  addCourseSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CoursesActions.addCourseSuccess),
        tap(() => {
          this.snackBar.open('Course added successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Update Course Effect
   * Uses concatMap to ensure sequential processing
   */
  updateCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursesActions.updateCourse),
      concatMap(({ id, changes }) =>
        this.coursesService.updateCourse(id, changes).pipe(
          map(updatedCourse => CoursesActions.updateCourseSuccess({ course: updatedCourse })),
          catchError(error => of(CoursesActions.updateCourseFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Update Course Success Effect
   * Show success notification
   */
  updateCourseSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CoursesActions.updateCourseSuccess),
        tap(() => {
          this.snackBar.open('Course updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Delete Course Effect
   * Uses concatMap to ensure sequential processing
   */
  deleteCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursesActions.deleteCourse),
      concatMap(({ id }) =>
        this.coursesService.deleteCourse(id).pipe(
          map(() => CoursesActions.deleteCourseSuccess({ id })),
          catchError(error => of(CoursesActions.deleteCourseFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Delete Course Success Effect
   * Show success notification
   */
  deleteCourseSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CoursesActions.deleteCourseSuccess),
        tap(() => {
          this.snackBar.open('Course deleted successfully', 'Close', {
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
          CoursesActions.loadCoursesFailure,
          CoursesActions.addCourseFailure,
          CoursesActions.updateCourseFailure,
          CoursesActions.deleteCourseFailure
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
