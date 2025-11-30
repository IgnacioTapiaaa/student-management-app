import { EntityState } from '@ngrx/entity';
import { Student } from '../../../core/models/student.interface';

/**
 * Students Feature State
 * Uses @ngrx/entity for normalized state management
 */
export interface StudentsState extends EntityState<Student> {
  // EntityState provides: entities: Dictionary<Student>, ids: string[]
  selectedStudentId: number | null;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}
