import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Student } from '../../../core/models/student.interface';
import { StudentsState } from './students.state';
import * as StudentsActions from './students.actions';

/**
 * Entity Adapter for Students
 * Provides normalized CRUD operations
 */
export const adapter: EntityAdapter<Student> = createEntityAdapter<Student>({
  selectId: (student: Student) => student.id,
  sortComparer: false // Can add sorting if needed: (a, b) => a.lastName.localeCompare(b.lastName)
});

/**
 * Initial Students State
 */
export const initialStudentsState: StudentsState = adapter.getInitialState({
  selectedStudentId: null,
  loading: false,
  error: null,
  loaded: false
});

/**
 * Students Reducer
 * Handles all students-related state changes using entity adapter
 */
export const studentsReducer = createReducer(
  initialStudentsState,

  // Load Students Actions
  on(StudentsActions.loadStudents, (state): StudentsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(StudentsActions.loadStudentsSuccess, (state, { students }): StudentsState =>
    adapter.setAll(students, {
      ...state,
      loading: false,
      loaded: true,
      error: null
    })
  ),

  on(StudentsActions.loadStudentsFailure, (state, { error }): StudentsState => ({
    ...state,
    loading: false,
    error
  })),

  // Add Student Actions
  on(StudentsActions.addStudent, (state): StudentsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(StudentsActions.addStudentSuccess, (state, { student }): StudentsState =>
    adapter.addOne(student, {
      ...state,
      loading: false,
      error: null
    })
  ),

  on(StudentsActions.addStudentFailure, (state, { error }): StudentsState => ({
    ...state,
    loading: false,
    error
  })),

  // Update Student Actions
  on(StudentsActions.updateStudent, (state): StudentsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(StudentsActions.updateStudentSuccess, (state, { student }): StudentsState =>
    adapter.updateOne(
      { id: student.id, changes: student },
      {
        ...state,
        loading: false,
        error: null
      }
    )
  ),

  on(StudentsActions.updateStudentFailure, (state, { error }): StudentsState => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Student Actions
  on(StudentsActions.deleteStudent, (state): StudentsState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(StudentsActions.deleteStudentSuccess, (state, { id }): StudentsState =>
    adapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
      // Clear selection if deleted student was selected
      selectedStudentId: state.selectedStudentId === id ? null : state.selectedStudentId
    })
  ),

  on(StudentsActions.deleteStudentFailure, (state, { error }): StudentsState => ({
    ...state,
    loading: false,
    error
  })),

  // Selection Actions
  on(StudentsActions.selectStudent, (state, { id }): StudentsState => ({
    ...state,
    selectedStudentId: id
  })),

  on(StudentsActions.clearSelected, (state): StudentsState => ({
    ...state,
    selectedStudentId: null
  }))
);
