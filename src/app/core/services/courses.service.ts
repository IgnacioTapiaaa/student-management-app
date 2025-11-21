import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Course, CreateCourse, UpdateCourse } from '../models/course.interface';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/courses`;

  // Writable signal for manual updates after mutations
  private coursesWritableSignal = signal<Course[]>([]);

  // Public readonly signal
  public readonly courses = computed(() => this.coursesWritableSignal());

  // Computed signals for stats
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

  constructor() {
    // Load initial data
    this.loadCourses();
  }

  /**
   * Load all courses from API
   */
  private loadCourses(): void {
    this.http.get<Course[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (courses) => {
        this.coursesWritableSignal.set(courses);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.coursesWritableSignal.set([]);
      }
    });
  }

  /**
   * Refresh courses data from API
   */
  refreshCourses(): void {
    this.loadCourses();
  }

  /**
   * Add a new course via API
   */
  addCourse(course: CreateCourse): Observable<Course> {
    console.log('[CoursesService] addCourse called with:', course);

    return this.http.post<Course>(this.apiUrl, course).pipe(
      tap(newCourse => {
        console.log('[CoursesService] Course created:', newCourse);
        // Update local signal
        this.coursesWritableSignal.update(courses => [...courses, newCourse]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing course via API
   */
  updateCourse(id: number, changes: UpdateCourse): Observable<Course> {
    console.log('[CoursesService] updateCourse called with ID:', id, 'Changes:', changes);

    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Course>(url, changes).pipe(
      tap(updatedCourse => {
        console.log('[CoursesService] Course updated:', updatedCourse);
        // Update local signal
        this.coursesWritableSignal.update(courses =>
          courses.map(course =>
            course.id === id ? { ...course, ...updatedCourse } : course
          )
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a course via API
   */
  deleteCourse(id: number): Observable<void> {
    console.log('[CoursesService] deleteCourse called with ID:', id);

    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log('[CoursesService] Course deleted');
        // Update local signal
        this.coursesWritableSignal.update(courses =>
          courses.filter(course => course.id !== id)
        );
      }),
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
   * Increment enrollment count
   */
  incrementEnrollment(courseId: number): Observable<Course> {
    const course = this.getCourseById(courseId);

    if (!course || course.enrolled >= course.capacity) {
      return throwError(() => new Error('Cannot enroll: course is full or not found'));
    }

    return this.updateCourse(courseId, {
      enrolled: course.enrolled + 1
    });
  }

  /**
   * Decrement enrollment count
   */
  decrementEnrollment(courseId: number): Observable<Course> {
    const course = this.getCourseById(courseId);

    if (!course || course.enrolled <= 0) {
      return throwError(() => new Error('Cannot decrement: enrollment is already 0 or course not found'));
    }

    return this.updateCourse(courseId, {
      enrolled: course.enrolled - 1
    });
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

    console.error('[CoursesService] HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
