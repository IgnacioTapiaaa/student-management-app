import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StudentsState } from './students.state';
import { adapter } from './students.reducer';

/**
 * Students Selectors
 * Provides efficient memoized access to students state
 */

// Feature Selector
export const selectStudentsState = createFeatureSelector<StudentsState>('students');

// Entity Adapter Selectors
// These provide: selectIds, selectEntities, selectAll, selectTotal
const {
  selectIds: selectStudentIds,
  selectEntities: selectStudentEntities,
  selectAll: selectAllStudents,
  selectTotal: selectTotalStudentsCount
} = adapter.getSelectors(selectStudentsState);

// Export entity selectors
export { selectStudentIds, selectStudentEntities, selectAllStudents, selectTotalStudentsCount };

// Custom Selectors - Loading & Error States
export const selectStudentsLoading = createSelector(
  selectStudentsState,
  (state: StudentsState) => state.loading
);

export const selectStudentsError = createSelector(
  selectStudentsState,
  (state: StudentsState) => state.error
);

export const selectStudentsLoaded = createSelector(
  selectStudentsState,
  (state: StudentsState) => state.loaded
);

// Selection Selectors
export const selectSelectedStudentId = createSelector(
  selectStudentsState,
  (state: StudentsState) => state.selectedStudentId
);

export const selectSelectedStudent = createSelector(
  selectStudentEntities,
  selectSelectedStudentId,
  (entities, selectedId) => selectedId !== null ? entities[selectedId] : null
);

// Factory Selector - Get Student by ID
export const selectStudentById = (id: number) => createSelector(
  selectStudentEntities,
  (entities) => entities[id]
);

// Computed Selectors - Statistics
export const selectTotalStudents = createSelector(
  selectAllStudents,
  (students) => students.length
);

export const selectAverageAge = createSelector(
  selectAllStudents,
  (students) => {
    if (students.length === 0) {
      return 0;
    }
    const total = students.reduce((sum, student) => sum + student.age, 0);
    return Math.round(total / students.length);
  }
);

// Search/Filter Selectors
export const selectStudentsBySearchTerm = (searchTerm: string) => createSelector(
  selectAllStudents,
  (students) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return students;
    }
    const term = searchTerm.toLowerCase().trim();
    return students.filter(student =>
      student.firstName.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  }
);

// View Model Selector - Combines multiple state slices for UI
export const selectStudentsViewModel = createSelector(
  selectAllStudents,
  selectStudentsLoading,
  selectStudentsError,
  selectTotalStudents,
  selectAverageAge,
  (students, loading, error, total, averageAge) => ({
    students,
    loading,
    error,
    total,
    averageAge
  })
);
