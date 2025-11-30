import * as fromStudents from './students.selectors';
import { StudentsState } from './students.state';
import { Student } from '../../../core/models/student.interface';
import { adapter } from './students.reducer';
import { AppState } from '../../../store/app.state';

describe('Students Selectors', () => {
  const mockStudents: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', age: 20 },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', age: 22 },
    { id: 3, firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', age: 25 }
  ];

  const studentsState: StudentsState = adapter.setAll(mockStudents, {
    ...adapter.getInitialState(),
    selectedStudentId: 1,
    loading: false,
    error: null,
    loaded: true
  });

  const mockAppState: Partial<AppState> = {
    students: studentsState
  };

  describe('selectStudentsState', () => {
    it('should select the students state', () => {
      const result = fromStudents.selectStudentsState(mockAppState as AppState);
      expect(result).toEqual(studentsState);
    });
  });

  describe('selectAllStudents', () => {
    it('should return an array of all students', () => {
      const result = fromStudents.selectAllStudents(mockAppState as AppState);
      expect(result).toEqual(mockStudents);
      expect(result.length).toBe(3);
    });

    it('should return empty array when no students', () => {
      const emptyState = {
        students: adapter.getInitialState({
          selectedStudentId: null,
          loading: false,
          error: null,
          loaded: false
        })
      };
      const result = fromStudents.selectAllStudents(emptyState as AppState);
      expect(result).toEqual([]);
    });
  });

  describe('selectStudentEntities', () => {
    it('should return student entities dictionary', () => {
      const result = fromStudents.selectStudentEntities(mockAppState as AppState);
      expect(result[1]).toEqual(mockStudents[0]);
      expect(result[2]).toEqual(mockStudents[1]);
      expect(result[3]).toEqual(mockStudents[2]);
    });
  });

  describe('selectStudentIds', () => {
    it('should return array of student ids', () => {
      const result = fromStudents.selectStudentIds(mockAppState as AppState);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('selectTotalStudentsCount', () => {
    it('should return total count of students', () => {
      const result = fromStudents.selectTotalStudentsCount(mockAppState as AppState);
      expect(result).toBe(3);
    });
  });

  describe('selectStudentsLoading', () => {
    it('should return loading state', () => {
      const result = fromStudents.selectStudentsLoading(mockAppState as AppState);
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const loadingState = {
        students: { ...studentsState, loading: true }
      };
      const result = fromStudents.selectStudentsLoading(loadingState as AppState);
      expect(result).toBe(true);
    });
  });

  describe('selectStudentsError', () => {
    it('should return null when no error', () => {
      const result = fromStudents.selectStudentsError(mockAppState as AppState);
      expect(result).toBeNull();
    });

    it('should return error message when error exists', () => {
      const errorState = {
        students: { ...studentsState, error: 'Test error' }
      };
      const result = fromStudents.selectStudentsError(errorState as AppState);
      expect(result).toBe('Test error');
    });
  });

  describe('selectStudentsLoaded', () => {
    it('should return loaded state', () => {
      const result = fromStudents.selectStudentsLoaded(mockAppState as AppState);
      expect(result).toBe(true);
    });
  });

  describe('selectSelectedStudentId', () => {
    it('should return selected student id', () => {
      const result = fromStudents.selectSelectedStudentId(mockAppState as AppState);
      expect(result).toBe(1);
    });

    it('should return null when no student selected', () => {
      const noSelectionState = {
        students: { ...studentsState, selectedStudentId: null }
      };
      const result = fromStudents.selectSelectedStudentId(noSelectionState as AppState);
      expect(result).toBeNull();
    });
  });

  describe('selectSelectedStudent', () => {
    it('should return the selected student', () => {
      const result = fromStudents.selectSelectedStudent(mockAppState as AppState);
      expect(result).toEqual(mockStudents[0]);
    });

    it('should return null when no student selected', () => {
      const noSelectionState = {
        students: { ...studentsState, selectedStudentId: null }
      };
      const result = fromStudents.selectSelectedStudent(noSelectionState as AppState);
      expect(result).toBeNull();
    });
  });

  describe('selectStudentById', () => {
    it('should return student with matching id', () => {
      const selector = fromStudents.selectStudentById(2);
      const result = selector(mockAppState as AppState);
      expect(result).toEqual(mockStudents[1]);
    });

    it('should return undefined for non-existent id', () => {
      const selector = fromStudents.selectStudentById(999);
      const result = selector(mockAppState as AppState);
      expect(result).toBeUndefined();
    });
  });

  describe('selectTotalStudents', () => {
    it('should return total number of students', () => {
      const result = fromStudents.selectTotalStudents(mockAppState as AppState);
      expect(result).toBe(3);
    });
  });

  describe('selectAverageAge', () => {
    it('should calculate average age correctly', () => {
      const result = fromStudents.selectAverageAge(mockAppState as AppState);
      // Average of 20, 22, 25 = 67 / 3 = 22.33... rounded to 22
      expect(result).toBe(22);
    });

    it('should return 0 when no students', () => {
      const emptyState = {
        students: adapter.getInitialState({
          selectedStudentId: null,
          loading: false,
          error: null,
          loaded: false
        })
      };
      const result = fromStudents.selectAverageAge(emptyState as AppState);
      expect(result).toBe(0);
    });

    it('should round average age correctly', () => {
      const students: Student[] = [
        { id: 1, firstName: 'A', lastName: 'B', email: 'a@example.com', age: 20 },
        { id: 2, firstName: 'C', lastName: 'D', email: 'c@example.com', age: 21 }
      ];
      const state = {
        students: adapter.setAll(students, {
          ...adapter.getInitialState(),
          selectedStudentId: null,
          loading: false,
          error: null,
          loaded: true
        })
      };
      const result = fromStudents.selectAverageAge(state as AppState);
      expect(result).toBe(21); // (20 + 21) / 2 = 20.5 rounded to 21
    });
  });

  describe('selectStudentsBySearchTerm', () => {
    it('should return all students when search term is empty', () => {
      const selector = fromStudents.selectStudentsBySearchTerm('');
      const result = selector(mockAppState as AppState);
      expect(result.length).toBe(3);
    });

    it('should filter by first name', () => {
      const selector = fromStudents.selectStudentsBySearchTerm('john');
      const result = selector(mockAppState as AppState);
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('John');
    });

    it('should filter by last name', () => {
      const selector = fromStudents.selectStudentsBySearchTerm('smith');
      const result = selector(mockAppState as AppState);
      expect(result.length).toBe(1);
      expect(result[0].lastName).toBe('Smith');
    });

    it('should filter by email', () => {
      const selector = fromStudents.selectStudentsBySearchTerm('bob@example');
      const result = selector(mockAppState as AppState);
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('bob@example.com');
    });

    it('should be case insensitive', () => {
      const selector = fromStudents.selectStudentsBySearchTerm('JOHN');
      const result = selector(mockAppState as AppState);
      expect(result.length).toBe(1);
    });

    it('should trim whitespace', () => {
      const selector = fromStudents.selectStudentsBySearchTerm('  jane  ');
      const result = selector(mockAppState as AppState);
      expect(result.length).toBe(1);
    });
  });

  describe('selectStudentsViewModel', () => {
    it('should combine multiple selectors', () => {
      const result = fromStudents.selectStudentsViewModel(mockAppState as AppState);
      expect(result.students).toEqual(mockStudents);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.total).toBe(3);
      expect(result.averageAge).toBe(22);
    });

    it('should reflect loading state', () => {
      const loadingState = {
        students: { ...studentsState, loading: true }
      };
      const result = fromStudents.selectStudentsViewModel(loadingState as AppState);
      expect(result.loading).toBe(true);
    });

    it('should include error when present', () => {
      const errorState = {
        students: { ...studentsState, error: 'Test error' }
      };
      const result = fromStudents.selectStudentsViewModel(errorState as AppState);
      expect(result.error).toBe('Test error');
    });
  });
});
