import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StudentsEffects } from './students.effects';
import { StudentsService } from '../../../core/services/students.service';
import * as StudentsActions from './students.actions';
import { Student, CreateStudent } from '../../../core/models/student.interface';

describe('StudentsEffects', () => {
  let actions$: Observable<Action>;
  let effects: StudentsEffects;
  let studentsService: jasmine.SpyObj<StudentsService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let store: MockStore;

  const mockStudents: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', age: 20 },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', age: 22 }
  ];

  const mockCreateStudent: CreateStudent = {
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob@example.com',
    age: 21
  };

  const mockNewStudent: Student = {
    id: 3,
    ...mockCreateStudent
  };

  beforeEach(() => {
    const studentsServiceSpy = jasmine.createSpyObj('StudentsService', ['getAll', 'addStudent', 'updateStudent', 'deleteStudent']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        StudentsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: StudentsService, useValue: studentsServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    effects = TestBed.inject(StudentsEffects);
    studentsService = TestBed.inject(StudentsService) as jasmine.SpyObj<StudentsService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store?.resetSelectors();
  });

  describe('loadStudents$', () => {
    it('should dispatch loadStudentsSuccess with students data on success', (done) => {
      studentsService.getAll.and.returnValue(of(mockStudents));
      actions$ = of(StudentsActions.loadStudents());

      effects.loadStudents$.subscribe(action => {
        expect(action).toEqual(StudentsActions.loadStudentsSuccess({ students: mockStudents }));
        expect(studentsService.getAll).toHaveBeenCalled();
        done();
      });
    });

    it('should dispatch loadStudentsFailure on error', (done) => {
      const error = new Error('Load failed');
      studentsService.getAll.and.returnValue(throwError(() => error));
      actions$ = of(StudentsActions.loadStudents());

      effects.loadStudents$.subscribe(action => {
        expect(action).toEqual(StudentsActions.loadStudentsFailure({ error: error.message }));
        done();
      });
    });
  });

  describe('addStudent$', () => {
    it('should dispatch addStudentSuccess when API call succeeds', (done) => {
      studentsService.addStudent.and.returnValue(of(mockNewStudent));
      actions$ = of(StudentsActions.addStudent({ student: mockCreateStudent }));

      effects.addStudent$.subscribe(action => {
        expect(action).toEqual(StudentsActions.addStudentSuccess({ student: mockNewStudent }));
        expect(studentsService.addStudent).toHaveBeenCalledWith(mockCreateStudent);
        done();
      });
    });

    it('should dispatch addStudentFailure on error', (done) => {
      const error = new Error('Add failed');
      studentsService.addStudent.and.returnValue(throwError(() => error));
      actions$ = of(StudentsActions.addStudent({ student: mockCreateStudent }));

      effects.addStudent$.subscribe(action => {
        expect(action).toEqual(StudentsActions.addStudentFailure({ error: error.message }));
        done();
      });
    });
  });

  describe('addStudentSuccess$', () => {
    it('should show success snackbar', (done) => {
      actions$ = of(StudentsActions.addStudentSuccess({ student: mockNewStudent }));

      effects.addStudentSuccess$.subscribe(() => {
        expect(snackBar.open).toHaveBeenCalledWith('Student added successfully', 'Close', jasmine.any(Object));
        done();
      });
    });
  });

  describe('updateStudent$', () => {
    it('should dispatch updateStudentSuccess when API call succeeds', (done) => {
      const updatedStudent = { ...mockStudents[0], age: 21 };
      const changes = { age: 21 };
      studentsService.updateStudent.and.returnValue(of(updatedStudent));
      actions$ = of(StudentsActions.updateStudent({ id: 1, changes }));

      effects.updateStudent$.subscribe(action => {
        expect(action).toEqual(StudentsActions.updateStudentSuccess({ student: updatedStudent }));
        expect(studentsService.updateStudent).toHaveBeenCalledWith(1, changes);
        done();
      });
    });

    it('should dispatch updateStudentFailure on error', (done) => {
      const error = new Error('Update failed');
      studentsService.updateStudent.and.returnValue(throwError(() => error));
      actions$ = of(StudentsActions.updateStudent({ id: 1, changes: { age: 21 } }));

      effects.updateStudent$.subscribe(action => {
        expect(action).toEqual(StudentsActions.updateStudentFailure({ error: error.message }));
        done();
      });
    });
  });

  describe('deleteStudent$', () => {
    it('should dispatch deleteStudentSuccess when API call succeeds', (done) => {
      studentsService.deleteStudent.and.returnValue(of(undefined));
      actions$ = of(StudentsActions.deleteStudent({ id: 1 }));

      effects.deleteStudent$.subscribe(action => {
        expect(action).toEqual(StudentsActions.deleteStudentSuccess({ id: 1 }));
        expect(studentsService.deleteStudent).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should dispatch deleteStudentFailure on error', (done) => {
      const error = new Error('Delete failed');
      studentsService.deleteStudent.and.returnValue(throwError(() => error));
      actions$ = of(StudentsActions.deleteStudent({ id: 1 }));

      effects.deleteStudent$.subscribe(action => {
        expect(action).toEqual(StudentsActions.deleteStudentFailure({ error: error.message }));
        done();
      });
    });
  });

  describe('handleErrors$', () => {
    it('should show error snackbar for any failure action', (done) => {
      const errorMessage = 'Test error';
      actions$ = of(StudentsActions.loadStudentsFailure({ error: errorMessage }));

      effects.handleErrors$.subscribe(() => {
        expect(snackBar.open).toHaveBeenCalledWith(errorMessage, 'Close', jasmine.any(Object));
        done();
      });
    });
  });
});
