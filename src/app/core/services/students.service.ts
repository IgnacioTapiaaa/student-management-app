import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Student, CreateStudent, UpdateStudent } from '../models/student.interface';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/students`;

  // Writable signal for manual updates after mutations
  private studentsWritableSignal = signal<Student[]>([]);

  // Public readonly signal
  public readonly students = computed(() => this.studentsWritableSignal());

  // Computed signals for stats
  public readonly totalStudents = computed(() => this.students().length);

  public readonly averageAge = computed(() => {
    const studentsList = this.students();
    if (studentsList.length === 0) {
      return 0;
    }
    const total = studentsList.reduce((sum, student) => sum + student.age, 0);
    return Math.round(total / studentsList.length);
  });

  constructor() {
    // Load initial data
    this.loadStudents();
  }

  /**
   * Load all students from API
   */
  private loadStudents(): void {
    this.http.get<Student[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (students) => {
        this.studentsWritableSignal.set(students);
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.studentsWritableSignal.set([]);
      }
    });
  }

  /**
   * Refresh students data from API
   */
  refreshStudents(): void {
    this.loadStudents();
  }

  /**
   * Add a new student via API
   */
  addStudent(student: CreateStudent): Observable<Student> {
    console.log('[StudentsService] addStudent called with:', student);

    return this.http.post<Student>(this.apiUrl, student).pipe(
      tap(newStudent => {
        console.log('[StudentsService] Student created:', newStudent);
        // Update local signal
        this.studentsWritableSignal.update(students => [...students, newStudent]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing student via API
   */
  updateStudent(id: number, changes: UpdateStudent): Observable<Student> {
    console.log('[StudentsService] updateStudent called with ID:', id, 'Changes:', changes);

    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Student>(url, changes).pipe(
      tap(updatedStudent => {
        console.log('[StudentsService] Student updated:', updatedStudent);
        // Update local signal
        this.studentsWritableSignal.update(students =>
          students.map(student =>
            student.id === id ? { ...student, ...updatedStudent } : student
          )
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a student via API
   */
  deleteStudent(id: number): Observable<void> {
    console.log('[StudentsService] deleteStudent called with ID:', id);

    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log('[StudentsService] Student deleted');
        // Update local signal
        this.studentsWritableSignal.update(students =>
          students.filter(student => student.id !== id)
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a student by ID (from local signal)
   */
  getStudentById(id: number): Student | undefined {
    return this.students().find(s => s.id === id);
  }

  /**
   * Search students (from local signal)
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

    console.error('[StudentsService] HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
