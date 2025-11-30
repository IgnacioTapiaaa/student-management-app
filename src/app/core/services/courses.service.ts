import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Course, CreateCourse, UpdateCourse } from '../models/course.interface';
import { environment } from '../../../environments/environment';
import * as CoursesSelectors from '../../features/courses/store/courses.selectors';

/**
 * Courses Service
 * Handles HTTP operations for courses
 * Provides backward compatibility with signal-based API via NGRX Store
 */
@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private apiUrl = `${environment.apiUrl}/courses`;

  // Store Observables
  private courses$ = this.store.select(CoursesSelectors.selectAllCourses);
  private totalCourses$ = this.store.select(CoursesSelectors.selectTotalCourses);
  private averageEnrollment$ = this.store.select(CoursesSelectors.selectAverageEnrollment);

  // Backward compatibility - Signal-based API
  private coursesSignal = toSignal(this.courses$, { initialValue: [] });
  public readonly courses = computed(() => this.coursesSignal());
  public readonly totalCourses = computed(() => this.courses().length);

  public readonly activeCourses = computed(() =>
    this.courses().filter(course => {
      const now = new Date();
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      return startDate <= now && endDate >= now;
    }).length
  );

  public readonly averageEnrollment = computed(() => {
    const coursesList = this.courses();
    if (coursesList.length === 0) {
      return 0;
    }
    const total = coursesList.reduce((sum, course) => sum + course.enrolled, 0);
    return Math.round(total / coursesList.length);
  });

  /**
   * Get all courses from API
   */
  getAll(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add a new course via API
   */
  addCourse(course: CreateCourse): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing course via API
   */
  updateCourse(id: number, changes: UpdateCourse): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Course>(url, changes).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a course via API
   */
  deleteCourse(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a course by ID (from local signal)
   */
  getCourseById(id: number): Course | undefined {
    return this.courses().find(c => c.id === id);
  }

  /**
   * Search courses (from local signal)
   */
  searchCourses(term: string): Course[] {
    if (!term || term.trim() === '') {
      return this.courses();
    }

    const searchTerm = term.toLowerCase().trim();

    return this.courses().filter(course =>
      course.name.toLowerCase().includes(searchTerm) ||
      course.code.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get available courses (from local signal)
   */
  getAvailableCourses(): Course[] {
    return this.courses().filter(course =>
      course.enrolled < course.capacity
    );
  }

  /**
   * Check if enrollment is possible (from local signal)
   */
  canEnroll(courseId: number): boolean {
    const course = this.getCourseById(courseId);
    return course ? course.enrolled < course.capacity : false;
  }

  /**
   * Get a course by ID from API
   */
  getById(id: number): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Course>(url).pipe(
      catchError(this.handleError)
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
