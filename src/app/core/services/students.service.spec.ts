import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { StudentsService } from './students.service';
import { Student, CreateStudent, UpdateStudent } from '../models/student.interface';
import { environment } from '../../../environments/environment.development';
import { AppState } from '../../store/app.state';

describe('StudentsService', () => {
  let service: StudentsService;
  let httpMock: HttpTestingController;
  let store: MockStore<AppState>;
  const apiUrl = `${environment.apiUrl}/students`;

  const mockStudents: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', age: 20, email: 'john@test.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', age: 22, email: 'jane@test.com' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', age: 21, email: 'bob@test.com' }
  ];

  const initialState: Partial<AppState> = {
    students: {
      ids: [1, 2, 3],
      entities: {
        1: mockStudents[0],
        2: mockStudents[1],
        3: mockStudents[2]
      },
      selectedStudentId: null,
      loading: false,
      error: null,
      loaded: true
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StudentsService,
        provideMockStore({ initialState })
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    service = TestBed.inject(StudentsService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide students signal from store', () => {
    expect(service.students().length).toBe(3);
    expect(service.students()).toContain(mockStudents[0]);
  });

  it('should calculate total students correctly', () => {
    expect(service.totalStudents()).toBe(3);
  });

  it('should calculate average age correctly', () => {
    expect(service.averageAge()).toBe(21);
  });

  it('should handle empty students list for average age', () => {
    store.setState({
      ...initialState,
      students: {
        ids: [],
        entities: {},
        selectedStudentId: null,
        loading: false,
        error: null,
        loaded: true
      }
    } as AppState);

    expect(service.averageAge()).toBe(0);
  });

  it('should get all students via HTTP', (done) => {
    service.getAll().subscribe(students => {
      expect(students).toEqual(mockStudents);
      done();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);
  });

  it('should get student by ID via HTTP', (done) => {
    const studentId = 1;
    service.getById(studentId).subscribe(student => {
      expect(student).toEqual(mockStudents[0]);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents[0]);
  });

  it('should add student via POST', (done) => {
    const newStudent: CreateStudent = {
      firstName: 'Alice',
      lastName: 'Brown',
      age: 23,
      email: 'alice@test.com'
    };

    const createdStudent: Student = {
      id: 4,
      ...newStudent
    };

    service.addStudent(newStudent).subscribe(student => {
      expect(student).toEqual(createdStudent);
      done();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush(createdStudent);
  });

  it('should update student via PUT', (done) => {
    const studentId = 1;
    const updates: UpdateStudent = {
      firstName: 'John',
      lastName: 'Doe Updated',
      age: 21,
      email: 'john.updated@test.com'
    };

    const updatedStudent: Student = {
      id: studentId,
      firstName: 'John',
      lastName: 'Doe Updated',
      age: 21,
      email: 'john.updated@test.com'
    };

    service.updateStudent(studentId, updates).subscribe(student => {
      expect(student).toEqual(updatedStudent);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updates);
    req.flush(updatedStudent);
  });

  it('should delete student via DELETE', (done) => {
    const studentId = 1;

    service.deleteStudent(studentId).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get student by ID from signal', () => {
    const student = service.getStudentById(2);
    expect(student).toBeDefined();
    expect(student?.firstName).toBe('Jane');
    expect(student?.lastName).toBe('Smith');
  });

  it('should return undefined for non-existent student ID', () => {
    const student = service.getStudentById(999);
    expect(student).toBeUndefined();
  });

  it('should search students by first name', () => {
    const results = service.searchStudents('Jane');
    expect(results.length).toBe(1);
    expect(results[0].firstName).toBe('Jane');
  });

  it('should search students by last name', () => {
    const results = service.searchStudents('Smith');
    expect(results.length).toBe(1);
    expect(results[0].lastName).toBe('Smith');
  });

  it('should search students by email', () => {
    const results = service.searchStudents('bob@test');
    expect(results.length).toBe(1);
    expect(results[0].email).toBe('bob@test.com');
  });

  it('should search students case-insensitively', () => {
    const results = service.searchStudents('JANE');
    expect(results.length).toBe(1);
    expect(results[0].firstName).toBe('Jane');
  });

  it('should return all students for empty search term', () => {
    const results = service.searchStudents('');
    expect(results.length).toBe(3);
  });

  it('should return all students for whitespace search term', () => {
    const results = service.searchStudents('   ');
    expect(results.length).toBe(3);
  });

  it('should handle HTTP error on getAll', (done) => {
    service.getAll().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
  });

  it('should handle HTTP error on add student', (done) => {
    const newStudent: CreateStudent = {
      firstName: 'Test',
      lastName: 'Error',
      age: 25,
      email: 'error@test.com'
    };

    service.addStudent(newStudent).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
  });

  it('should handle HTTP error on update student', (done) => {
    const studentId = 1;
    const updates: UpdateStudent = {
      firstName: 'Test',
      lastName: 'Error',
      age: 25,
      email: 'error@test.com'
    };

    service.updateStudent(studentId, updates).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
  });

  it('should handle HTTP error on delete student', (done) => {
    const studentId = 1;

    service.deleteStudent(studentId).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });
  });
});
