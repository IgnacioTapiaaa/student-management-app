import { Injectable, inject, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student, CreateStudent, UpdateStudent } from '../models/student.interface';
import { environment } from '../../../environments/environment';
import * as StudentsSelectors from '../../features/students/store/students.selectors';

/**
 * Students Service
 * Handles HTTP operations for students
 * Provides backward compatibility with signal-based API via NGRX Store
 */
@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private apiUrl = `${environment.apiUrl}/students`;

  // Store Observables
  private students$ = this.store.select(StudentsSelectors.selectAllStudents);
  private totalStudents$ = this.store.select(StudentsSelectors.selectTotalStudents);
  private averageAge$ = this.store.select(StudentsSelectors.selectAverageAge);

  // Backward compatibility - Signal-based API
  private studentsSignal = toSignal(this.students$, { initialValue: [] });
  public readonly students = computed(() => this.studentsSignal());
  public readonly totalStudents = computed(() => this.students().length);
  public readonly averageAge = computed(() => {
    const studentsList = this.students();
    if (studentsList.length === 0) {
      return 0;
    }
    const total = studentsList.reduce((sum, student) => sum + student.age, 0);
    return Math.round(total / studentsList.length);
  });

  /**
   * Get all students from API
   */
  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a student by ID
   */
  getById(id: number): Observable<Student> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Student>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a student by ID (from local signal)
   * For backward compatibility
   */
  getStudentById(id: number): Student | undefined {
    return this.students().find(s => s.id === id);
  }

  /**
   * Add a new student via API
   */
  addStudent(student: CreateStudent): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing student via API
   */
  updateStudent(id: number, changes: UpdateStudent): Observable<Student> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Student>(url, changes).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a student via API
   */
  deleteStudent(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search students (from local signal)
   * For backward compatibility
   */
  searchStudents(term: string): Student[] {
    if (!term || term.trim() === '') {
      return this.students();
    }

    const searchTerm = term.toLowerCase().trim();

    return this.students().filter(student =>
      student.firstName.toLowerCase().includes(searchTerm) ||
      student.lastName.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
