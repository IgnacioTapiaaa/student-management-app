import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InscriptionsState } from './inscriptions.state';
import { adapter } from './inscriptions.reducer';
import { Inscription } from '../../../core/models/inscription.interface';
import { selectAllStudents, selectStudentEntities } from '../../students/store/students.selectors';
import { selectAllCourses, selectCourseEntities } from '../../courses/store/courses.selectors';

/**
 * Enriched Inscription Interface
 * Combines inscription data with student and course details
 */
export interface EnrichedInscription extends Inscription {
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  courseCode?: string;
}

/**
 * Feature selector for inscriptions state
 */
export const selectInscriptionsState = createFeatureSelector<InscriptionsState>('inscriptions');

/**
 * Entity Adapter Selectors
 * Provides selectAll, selectEntities, selectIds, selectTotal
 */
const adapterSelectors = adapter.getSelectors(selectInscriptionsState);

// Export adapter selectors with descriptive names
export const selectAllInscriptions = adapterSelectors.selectAll;
export const selectInscriptionEntities = adapterSelectors.selectEntities;
export const selectInscriptionIds = adapterSelectors.selectIds;
export const selectTotalInscriptions = adapterSelectors.selectTotal;

/**
 * Basic State Selectors
 */
export const selectInscriptionsLoading = createSelector(
  selectInscriptionsState,
  (state: InscriptionsState) => state.loading
);

export const selectInscriptionsError = createSelector(
  selectInscriptionsState,
  (state: InscriptionsState) => state.error
);

export const selectInscriptionsLoaded = createSelector(
  selectInscriptionsState,
  (state: InscriptionsState) => state.loaded
);

export const selectSelectedInscriptionId = createSelector(
  selectInscriptionsState,
  (state: InscriptionsState) => state.selectedInscriptionId
);

/**
 * Computed Selectors
 */

// Select an inscription by ID (factory selector)
export const selectInscriptionById = (inscriptionId: number) =>
  createSelector(
    selectInscriptionEntities,
    (entities) => entities[inscriptionId]
  );

// Select currently selected inscription
export const selectSelectedInscription = createSelector(
  selectInscriptionEntities,
  selectSelectedInscriptionId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

/**
 * Relationship Selectors
 */

// Select inscriptions by student ID (factory selector)
export const selectInscriptionsByStudentId = (studentId: number) =>
  createSelector(
    selectAllInscriptions,
    (inscriptions: Inscription[]) =>
      inscriptions.filter(inscription => inscription.studentId === studentId)
  );

// Select inscriptions by course ID (factory selector)
export const selectInscriptionsByCourseId = (courseId: number) =>
  createSelector(
    selectAllInscriptions,
    (inscriptions: Inscription[]) =>
      inscriptions.filter(inscription => inscription.courseId === courseId)
  );

// Select inscriptions by status (factory selector)
export const selectInscriptionsByStatus = (status: 'active' | 'completed' | 'cancelled') =>
  createSelector(
    selectAllInscriptions,
    (inscriptions: Inscription[]) =>
      inscriptions.filter(inscription => inscription.status === status)
  );

/**
 * Status-based Selectors
 */
export const selectActiveInscriptions = createSelector(
  selectAllInscriptions,
  (inscriptions: Inscription[]) =>
    inscriptions.filter(inscription => inscription.status === 'active')
);

export const selectCompletedInscriptions = createSelector(
  selectAllInscriptions,
  (inscriptions: Inscription[]) =>
    inscriptions.filter(inscription => inscription.status === 'completed')
);

export const selectCancelledInscriptions = createSelector(
  selectAllInscriptions,
  (inscriptions: Inscription[]) =>
    inscriptions.filter(inscription => inscription.status === 'cancelled')
);

/**
 * Join Selectors - Enriched Inscriptions
 * Combines inscription data with student and course information
 */
export const selectEnrichedInscriptions = createSelector(
  selectAllInscriptions,
  selectStudentEntities,
  selectCourseEntities,
  (inscriptions, studentEntities, courseEntities): EnrichedInscription[] =>
    inscriptions.map(inscription => {
      const student = studentEntities[inscription.studentId];
      const course = courseEntities[inscription.courseId];

      return {
        ...inscription,
        studentName: student
          ? `${student.firstName} ${student.lastName}`
          : 'Unknown Student',
        studentEmail: student?.email || 'N/A',
        courseName: course?.name || 'Unknown Course',
        courseCode: course?.code || 'N/A'
      };
    })
);

// Select enriched active inscriptions
export const selectEnrichedActiveInscriptions = createSelector(
  selectEnrichedInscriptions,
  (enrichedInscriptions) =>
    enrichedInscriptions.filter(inscription => inscription.status === 'active')
);

// Select enriched inscriptions by student ID (factory selector)
export const selectEnrichedInscriptionsByStudentId = (studentId: number) =>
  createSelector(
    selectEnrichedInscriptions,
    (enrichedInscriptions) =>
      enrichedInscriptions.filter(inscription => inscription.studentId === studentId)
  );

// Select enriched inscriptions by course ID (factory selector)
export const selectEnrichedInscriptionsByCourseId = (courseId: number) =>
  createSelector(
    selectEnrichedInscriptions,
    (enrichedInscriptions) =>
      enrichedInscriptions.filter(inscription => inscription.courseId === courseId)
  );

/**
 * Statistics Selectors
 */
export const selectTotalActiveInscriptions = createSelector(
  selectActiveInscriptions,
  (inscriptions) => inscriptions.length
);

export const selectTotalCompletedInscriptions = createSelector(
  selectCompletedInscriptions,
  (inscriptions) => inscriptions.length
);

export const selectTotalCancelledInscriptions = createSelector(
  selectCancelledInscriptions,
  (inscriptions) => inscriptions.length
);

/**
 * View Model Selector
 * Combines multiple selectors for component consumption
 */
export const selectInscriptionsViewModel = createSelector(
  selectEnrichedInscriptions,
  selectInscriptionsLoading,
  selectInscriptionsError,
  selectTotalInscriptions,
  selectTotalActiveInscriptions,
  (inscriptions, loading, error, total, active) => ({
    inscriptions,
    loading,
    error,
    total,
    active
  })
);
