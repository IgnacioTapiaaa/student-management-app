import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoursesState } from './courses.state';
import { adapter } from './courses.reducer';
import { Course } from '../../../core/models/course.interface';

/**
 * Feature selector for courses state
 */
export const selectCoursesState = createFeatureSelector<CoursesState>('courses');

/**
 * Entity Adapter Selectors
 * Provides selectAll, selectEntities, selectIds, selectTotal
 */
const adapterSelectors = adapter.getSelectors(selectCoursesState);

// Export adapter selectors with descriptive names
export const selectAllCourses = adapterSelectors.selectAll;
export const selectCourseEntities = adapterSelectors.selectEntities;
export const selectCourseIds = adapterSelectors.selectIds;
export const selectTotalCourses = adapterSelectors.selectTotal;

/**
 * Basic State Selectors
 */
export const selectCoursesLoading = createSelector(
  selectCoursesState,
  (state: CoursesState) => state.loading
);

export const selectCoursesError = createSelector(
  selectCoursesState,
  (state: CoursesState) => state.error
);

export const selectCoursesLoaded = createSelector(
  selectCoursesState,
  (state: CoursesState) => state.loaded
);

export const selectSelectedCourseId = createSelector(
  selectCoursesState,
  (state: CoursesState) => state.selectedCourseId
);

/**
 * Computed Selectors
 */

// Select a course by ID (factory selector)
export const selectCourseById = (courseId: number) =>
  createSelector(
    selectCourseEntities,
    (entities) => entities[courseId]
  );

// Select currently selected course
export const selectSelectedCourse = createSelector(
  selectCourseEntities,
  selectSelectedCourseId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

// Select active courses (courses with available capacity)
export const selectActiveCourses = createSelector(
  selectAllCourses,
  (courses: Course[]) => courses.filter(course => course.enrolled < course.capacity)
);

// Select full courses (courses at capacity)
export const selectFullCourses = createSelector(
  selectAllCourses,
  (courses: Course[]) => courses.filter(course => course.enrolled >= course.capacity)
);

// Calculate average enrollment across all courses
export const selectAverageEnrollment = createSelector(
  selectAllCourses,
  (courses: Course[]) => {
    if (courses.length === 0) return 0;
    const totalEnrolled = courses.reduce((sum, course) => sum + course.enrolled, 0);
    return Math.round((totalEnrolled / courses.length) * 10) / 10; // Round to 1 decimal
  }
);

// Calculate total enrollment across all courses
export const selectTotalEnrollment = createSelector(
  selectAllCourses,
  (courses: Course[]) => courses.reduce((sum, course) => sum + course.enrolled, 0)
);

// Calculate average capacity utilization percentage
export const selectAverageCapacityUtilization = createSelector(
  selectAllCourses,
  (courses: Course[]) => {
    if (courses.length === 0) return 0;
    const utilizationSum = courses.reduce((sum, course) => {
      return sum + (course.capacity > 0 ? (course.enrolled / course.capacity) * 100 : 0);
    }, 0);
    return Math.round(utilizationSum / courses.length);
  }
);

// Select courses sorted by enrollment (descending)
export const selectCoursesByEnrollment = createSelector(
  selectAllCourses,
  (courses: Course[]) => [...courses].sort((a, b) => b.enrolled - a.enrolled)
);

// Select courses sorted by available spots (ascending)
export const selectCoursesByAvailableSpots = createSelector(
  selectAllCourses,
  (courses: Course[]) =>
    [...courses].sort((a, b) => (a.capacity - a.enrolled) - (b.capacity - b.enrolled))
);

/**
 * View Model Selector
 * Combines multiple selectors for component consumption
 */
export const selectCoursesViewModel = createSelector(
  selectAllCourses,
  selectCoursesLoading,
  selectCoursesError,
  selectTotalCourses,
  selectAverageEnrollment,
  selectActiveCourses,
  (courses, loading, error, total, averageEnrollment, activeCourses) => ({
    courses,
    loading,
    error,
    total,
    averageEnrollment,
    activeCourses: activeCourses.length
  })
);
