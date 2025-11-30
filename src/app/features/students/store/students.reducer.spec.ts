import { studentsReducer, initialStudentsState, adapter } from './students.reducer';
import * as StudentsActions from './students.actions';
import { Student, CreateStudent } from '../../../core/models/student.interface';
import { StudentsState } from './students.state';

describe('StudentsReducer', () => {
  const mockStudents: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', age: 20 },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', age: 22 },
    { id: 3, firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', age: 21 }
  ];

  describe('Initial State', () => {
    it('should return the initial state', () => {
      const action = { type: 'Unknown' } as any;
      const result = studentsReducer(undefined, action);

      expect(result).toEqual(initialStudentsState);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.loaded).toBe(false);
      expect(result.selectedStudentId).toBeNull();
    });

    it('should have empty entities initially', () => {
      expect(initialStudentsState.ids.length).toBe(0);
      expect(Object.keys(initialStudentsState.entities).length).toBe(0);
    });
  });

  describe('Load Students Actions', () => {
    it('should set loading to true on loadStudents', () => {
      const action = StudentsActions.loadStudents();
      const result = studentsReducer(initialStudentsState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should populate entities on loadStudentsSuccess', () => {
      const action = StudentsActions.loadStudentsSuccess({ students: mockStudents });
      const result = studentsReducer(initialStudentsState, action);

      expect(result.loading).toBe(false);
      expect(result.loaded).toBe(true);
      expect(result.error).toBeNull();
      expect(result.ids.length).toBe(3);
      expect(result.entities[1]).toEqual(mockStudents[0]);
      expect(result.entities[2]).toEqual(mockStudents[1]);
      expect(result.entities[3]).toEqual(mockStudents[2]);
    });

    it('should replace existing students on loadStudentsSuccess', () => {
      const existingState = adapter.setAll(mockStudents, initialStudentsState);
      const newStudents: Student[] = [
        { id: 4, firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', age: 23 }
      ];
      const action = StudentsActions.loadStudentsSuccess({ students: newStudents });
      const result = studentsReducer(existingState, action);

      expect(result.ids.length).toBe(1);
      expect(result.entities[4]).toEqual(newStudents[0]);
      expect(result.entities[1]).toBeUndefined();
    });

    it('should set error on loadStudentsFailure', () => {
      const error = 'Failed to load students';
      const action = StudentsActions.loadStudentsFailure({ error });
      const result = studentsReducer(initialStudentsState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('Add Student Actions', () => {
    it('should set loading to true on addStudent', () => {
      const student: CreateStudent = {
        firstName: 'New',
        lastName: 'Student',
        email: 'new@example.com',
        age: 20
      };
      const action = StudentsActions.addStudent({ student });
      const result = studentsReducer(initialStudentsState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should add student to entities on addStudentSuccess', () => {
      const newStudent: Student = {
        id: 4,
        firstName: 'New',
        lastName: 'Student',
        email: 'new@example.com',
        age: 20
      };
      const action = StudentsActions.addStudentSuccess({ student: newStudent });
      const result = studentsReducer(initialStudentsState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids.length).toBe(1);
      expect(result.entities[4]).toEqual(newStudent);
    });

    it('should append to existing students on addStudentSuccess', () => {
      const existingState = adapter.setAll(mockStudents, initialStudentsState);
      const newStudent: Student = {
        id: 4,
        firstName: 'New',
        lastName: 'Student',
        email: 'new@example.com',
        age: 20
      };
      const action = StudentsActions.addStudentSuccess({ student: newStudent });
      const result = studentsReducer(existingState, action);

      expect(result.ids.length).toBe(4);
      expect(result.entities[4]).toEqual(newStudent);
      expect(result.entities[1]).toEqual(mockStudents[0]);
    });

    it('should set error on addStudentFailure', () => {
      const error = 'Failed to add student';
      const action = StudentsActions.addStudentFailure({ error });
      const result = studentsReducer(initialStudentsState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('Update Student Actions', () => {
    let stateWithStudents: StudentsState;

    beforeEach(() => {
      stateWithStudents = adapter.setAll(mockStudents, initialStudentsState);
    });

    it('should set loading to true on updateStudent', () => {
      const action = StudentsActions.updateStudent({ id: 1, changes: { age: 21 } });
      const result = studentsReducer(stateWithStudents, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should update student on updateStudentSuccess', () => {
      const updatedStudent: Student = { ...mockStudents[0], age: 21 };
      const action = StudentsActions.updateStudentSuccess({ student: updatedStudent });
      const result = studentsReducer(stateWithStudents, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.entities[1]?.age).toBe(21);
      expect(result.entities[1]?.firstName).toBe('John');
    });

    it('should set error on updateStudentFailure', () => {
      const error = 'Failed to update student';
      const action = StudentsActions.updateStudentFailure({ error });
      const result = studentsReducer(stateWithStudents, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('Delete Student Actions', () => {
    let stateWithStudents: StudentsState;

    beforeEach(() => {
      stateWithStudents = adapter.setAll(mockStudents, initialStudentsState);
    });

    it('should set loading to true on deleteStudent', () => {
      const action = StudentsActions.deleteStudent({ id: 1 });
      const result = studentsReducer(stateWithStudents, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should remove student on deleteStudentSuccess', () => {
      const action = StudentsActions.deleteStudentSuccess({ id: 1 });
      const result = studentsReducer(stateWithStudents, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids.length).toBe(2);
      expect(result.entities[1]).toBeUndefined();
      expect(result.entities[2]).toBeDefined();
    });

    it('should clear selectedStudentId if deleted student was selected', () => {
      const stateWithSelection = { ...stateWithStudents, selectedStudentId: 1 };
      const action = StudentsActions.deleteStudentSuccess({ id: 1 });
      const result = studentsReducer(stateWithSelection, action);

      expect(result.selectedStudentId).toBeNull();
    });

    it('should keep selectedStudentId if different student was deleted', () => {
      const stateWithSelection = { ...stateWithStudents, selectedStudentId: 2 };
      const action = StudentsActions.deleteStudentSuccess({ id: 1 });
      const result = studentsReducer(stateWithSelection, action);

      expect(result.selectedStudentId).toBe(2);
    });

    it('should set error on deleteStudentFailure', () => {
      const error = 'Failed to delete student';
      const action = StudentsActions.deleteStudentFailure({ error });
      const result = studentsReducer(stateWithStudents, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('Selection Actions', () => {
    it('should set selectedStudentId on selectStudent', () => {
      const action = StudentsActions.selectStudent({ id: 1 });
      const result = studentsReducer(initialStudentsState, action);

      expect(result.selectedStudentId).toBe(1);
    });

    it('should clear selectedStudentId on clearSelected', () => {
      const stateWithSelection = { ...initialStudentsState, selectedStudentId: 1 };
      const action = StudentsActions.clearSelected();
      const result = studentsReducer(stateWithSelection, action);

      expect(result.selectedStudentId).toBeNull();
    });
  });
});
