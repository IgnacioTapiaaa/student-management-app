import { createReducer, on } from '@ngrx/store';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Course } from '../../../core/models/course.interface';
import { CoursesState, initialCoursesState } from './courses.state';
import * as CoursesActions from './courses.actions';

/**
 * Entity Adapter for Courses
 * Provides methods for managing normalized state
 */
export const adapter: EntityAdapter<Course> = createEntityAdapter<Course>({
  selectId: (course: Course) => course.id,
  sortComparer: false
});

/**
 * Initial state with EntityAdapter defaults
 */
export const initialState: CoursesState = adapter.getInitialState(initialCoursesState);

/**
 * Courses Reducer
 * Handles all course-related actions using EntityAdapter
 */
export const coursesReducer = createReducer(
  initialState,

  // Load Courses
  on(CoursesActions.loadCourses, (state): CoursesState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CoursesActions.loadCoursesSuccess, (state, { courses }): CoursesState =>
    adapter.setAll(courses, {
      ...state,
      loading: false,
      loaded: true,
      error: null
    })
  ),

  on(CoursesActions.loadCoursesFailure, (state, { error }): CoursesState => ({
    ...state,
    loading: false,
    error
  })),

  // Add Course
  on(CoursesActions.addCourse, (state): CoursesState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CoursesActions.addCourseSuccess, (state, { course }): CoursesState =>
    adapter.addOne(course, {
      ...state,
      loading: false,
      error: null
    })
  ),

  on(CoursesActions.addCourseFailure, (state, { error }): CoursesState => ({
    ...state,
    loading: false,
    error
  })),

  // Update Course
  on(CoursesActions.updateCourse, (state): CoursesState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CoursesActions.updateCourseSuccess, (state, { course }): CoursesState =>
    adapter.updateOne(
      { id: course.id, changes: course },
      {
        ...state,
        loading: false,
        error: null
      }
    )
  ),

  on(CoursesActions.updateCourseFailure, (state, { error }): CoursesState => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Course
  on(CoursesActions.deleteCourse, (state): CoursesState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CoursesActions.deleteCourseSuccess, (state, { id }): CoursesState =>
    adapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
      selectedCourseId: state.selectedCourseId === id ? null : state.selectedCourseId
    })
  ),

  on(CoursesActions.deleteCourseFailure, (state, { error }): CoursesState => ({
    ...state,
    loading: false,
    error
  })),

  // Enrollment Management (triggered by inscriptions)
  on(CoursesActions.incrementEnrollment, (state, { courseId }): CoursesState => {
    const course = state.entities[courseId];
    if (!course) return state;

    return adapter.updateOne(
      {
        id: courseId,
        changes: { enrolled: course.enrolled + 1 }
      },
      state
    );
  }),

  on(CoursesActions.decrementEnrollment, (state, { courseId }): CoursesState => {
    const course = state.entities[courseId];
    if (!course) return state;

    return adapter.updateOne(
      {
        id: courseId,
        changes: { enrolled: Math.max(0, course.enrolled - 1) }
      },
      state
    );
  }),

  // Selection
  on(CoursesActions.selectCourse, (state, { id }): CoursesState => ({
    ...state,
    selectedCourseId: id
  })),

  on(CoursesActions.clearSelected, (state): CoursesState => ({
    ...state,
    selectedCourseId: null
  }))
);
