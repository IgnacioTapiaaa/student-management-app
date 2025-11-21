import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentsService } from './students.service';
import { Student, CreateStudent, UpdateStudent } from '../models/student.interface';
import { environment } from '../../../environments/environment.development';

describe('StudentsService', () => {
  let service: StudentsService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/students`;

  const mockStudents: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', age: 20, email: 'john@test.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', age: 22, email: 'jane@test.com' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', age: 21, email: 'bob@test.com' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentsService]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StudentsService);

    // Handle the initial load request that happens in constructor
    const initialRequest = httpMock.expectOne(apiUrl);
    expect(initialRequest.request.method).toBe('GET');
    initialRequest.flush(mockStudents);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load students from API on init', () => {
    // The initial load already happened in beforeEach
    // Verify the students signal contains the data
    expect(service.students().length).toBe(3);
    expect(service.students()).toEqual(mockStudents);
  });

  it('should calculate total students correctly', () => {
    expect(service.totalStudents()).toBe(3);
  });

  it('should calculate average age correctly', () => {
    // (20 + 22 + 21) / 3 = 21
    expect(service.averageAge()).toBe(21);
  });

  it('should handle empty students list for average age', () => {
    // Create a fresh service instance
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentsService]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StudentsService);

    const req = httpMock.expectOne(apiUrl);
    req.flush([]);

    expect(service.averageAge()).toBe(0);
  });

  it('should add student via POST', () => {
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
      // Verify the student was added to the signal
      expect(service.students().length).toBe(4);
      expect(service.students()).toContain(createdStudent);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush(createdStudent);
  });

  it('should update student via PUT', () => {
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
      // Verify the student was updated in the signal
      const foundStudent = service.students().find(s => s.id === studentId);
      expect(foundStudent?.lastName).toBe('Doe Updated');
      expect(foundStudent?.email).toBe('john.updated@test.com');
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updates);
    req.flush(updatedStudent);
  });

  it('should delete student via DELETE', () => {
    const studentId = 1;
    const initialLength = service.students().length;

    service.deleteStudent(studentId).subscribe(() => {
      // Verify the student was removed from the signal
      expect(service.students().length).toBe(initialLength - 1);
      expect(service.students().find(s => s.id === studentId)).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should refresh students data', () => {
    const refreshedStudents: Student[] = [
      { id: 1, firstName: 'John', lastName: 'Doe', age: 20, email: 'john@test.com' },
      { id: 5, firstName: 'New', lastName: 'Student', age: 19, email: 'new@test.com' }
    ];

    service.refreshStudents();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(refreshedStudents);

    expect(service.students().length).toBe(2);
    expect(service.students()).toEqual(refreshedStudents);
  });

  it('should get student by ID', () => {
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
    expect(results).toEqual(mockStudents);
  });

  it('should handle HTTP error on load', () => {
    // Create a fresh service to test error handling
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentsService]
    });
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(console, 'error');
    service = TestBed.inject(StudentsService);

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

    // Should set empty array on error
    expect(service.students().length).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle HTTP error on add student', () => {
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
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });
  });
});
