import { RouterReducerState } from '@ngrx/router-store';
import { AuthState } from './auth/auth.state';
import { UiState } from './ui/ui.state';
import { StudentsState } from '../features/students/store/students.state';
import { CoursesState } from '../features/courses/store/courses.state';
import { InscriptionsState } from '../features/inscriptions/store/inscriptions.state';
import { UsersState } from '../features/users/store/users.state';
import { RouterStateUrl } from './router/custom-serializer';

/**
 * Global Application State
 * Contains all feature states for the application
 */
export interface AppState {
  auth: AuthState;
  ui: UiState;
  students: StudentsState;
  courses: CoursesState;
  inscriptions: InscriptionsState;
  users: UsersState;
  router: RouterReducerState<RouterStateUrl>;
}
