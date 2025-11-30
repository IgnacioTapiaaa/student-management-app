import { EntityState } from '@ngrx/entity';
import { Course } from '../../../core/models/course.interface';

/**
 * Courses Feature State
 * Uses @ngrx/entity for normalized state management
 */
export interface CoursesState extends EntityState<Course> {
  selectedCourseId: number | null;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

/**
 * Initial state for courses feature
 * EntityAdapter will initialize ids and entities properties
 */
export const initialCoursesState: Omit<CoursesState, 'ids' | 'entities'> = {
  selectedCourseId: null,
  loading: false,
  error: null,
  loaded: false
};
