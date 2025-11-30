import { createAction, props } from '@ngrx/store';
import { Course, CreateCourse, UpdateCourse } from '../../../core/models/course.interface';

/**
 * Courses Actions
 * Following the [Source] Action Description naming convention
 */

// Load Actions
export const loadCourses = createAction(
  '[Courses Page] Load Courses'
);

export const loadCoursesSuccess = createAction(
  '[Courses API] Load Courses Success',
  props<{ courses: Course[] }>()
);

export const loadCoursesFailure = createAction(
  '[Courses API] Load Courses Failure',
  props<{ error: string }>()
);

// Add Actions
export const addCourse = createAction(
  '[Courses Page] Add Course',
  props<{ course: CreateCourse }>()
);

export const addCourseSuccess = createAction(
  '[Courses API] Add Course Success',
  props<{ course: Course }>()
);

export const addCourseFailure = createAction(
  '[Courses API] Add Course Failure',
  props<{ error: string }>()
);

// Update Actions
export const updateCourse = createAction(
  '[Courses Page] Update Course',
  props<{ id: number; changes: UpdateCourse }>()
);

export const updateCourseSuccess = createAction(
  '[Courses API] Update Course Success',
  props<{ course: Course }>()
);

export const updateCourseFailure = createAction(
  '[Courses API] Update Course Failure',
  props<{ error: string }>()
);

// Delete Actions
export const deleteCourse = createAction(
  '[Courses Page] Delete Course',
  props<{ id: number }>()
);

export const deleteCourseSuccess = createAction(
  '[Courses API] Delete Course Success',
  props<{ id: number }>()
);

export const deleteCourseFailure = createAction(
  '[Courses API] Delete Course Failure',
  props<{ error: string }>()
);

// Enrollment Actions (triggered by inscriptions)
export const incrementEnrollment = createAction(
  '[Inscriptions API] Increment Course Enrollment',
  props<{ courseId: number }>()
);

export const decrementEnrollment = createAction(
  '[Inscriptions API] Decrement Course Enrollment',
  props<{ courseId: number }>()
);

// Selection Actions
export const selectCourse = createAction(
  '[Courses Page] Select Course',
  props<{ id: number }>()
);

export const clearSelected = createAction(
  '[Courses Page] Clear Selected'
);
