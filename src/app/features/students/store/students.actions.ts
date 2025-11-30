import { createAction, props } from '@ngrx/store';
import { Student, CreateStudent, UpdateStudent } from '../../../core/models/student.interface';

/**
 * Students Actions
 * Following naming convention: [Source] Action Description
 * Sources: [Students Page] for UI actions, [Students API] for API responses
 */

// Load Students Actions
export const loadStudents = createAction('[Students Page] Load Students');

export const loadStudentsSuccess = createAction(
  '[Students API] Load Students Success',
  props<{ students: Student[] }>()
);

export const loadStudentsFailure = createAction(
  '[Students API] Load Students Failure',
  props<{ error: string }>()
);

// Add Student Actions
export const addStudent = createAction(
  '[Students Page] Add Student',
  props<{ student: CreateStudent }>()
);

export const addStudentSuccess = createAction(
  '[Students API] Add Student Success',
  props<{ student: Student }>()
);

export const addStudentFailure = createAction(
  '[Students API] Add Student Failure',
  props<{ error: string }>()
);

// Update Student Actions
export const updateStudent = createAction(
  '[Students Page] Update Student',
  props<{ id: number; changes: UpdateStudent }>()
);

export const updateStudentSuccess = createAction(
  '[Students API] Update Student Success',
  props<{ student: Student }>()
);

export const updateStudentFailure = createAction(
  '[Students API] Update Student Failure',
  props<{ error: string }>()
);

// Delete Student Actions
export const deleteStudent = createAction(
  '[Students Page] Delete Student',
  props<{ id: number }>()
);

export const deleteStudentSuccess = createAction(
  '[Students API] Delete Student Success',
  props<{ id: number }>()
);

export const deleteStudentFailure = createAction(
  '[Students API] Delete Student Failure',
  props<{ error: string }>()
);

// Selection Actions
export const selectStudent = createAction(
  '[Students Page] Select Student',
  props<{ id: number }>()
);

export const clearSelected = createAction('[Students Page] Clear Selected');
