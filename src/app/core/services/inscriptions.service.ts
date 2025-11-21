import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Inscription, CreateInscription, UpdateInscription, InscriptionStatus } from '../models/inscription.interface';
import { CoursesService } from './courses.service';
import { StudentsService } from './students.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class InscriptionsService {
  private http = inject(HttpClient);
  private coursesService = inject(CoursesService);
  private studentsService = inject(StudentsService);
  private apiUrl = `${environment.apiUrl}/inscriptions`;

  // Writable signal for manual updates after mutations
  private inscriptionsWritableSignal = signal<Inscription[]>([]);

  // Public readonly signal
  public readonly inscriptions = computed(() => this.inscriptionsWritableSignal());

  // Computed signals for stats
  public readonly totalInscriptions = computed(() => this.inscriptions().length);

  public readonly activeInscriptions = computed(() =>
    this.inscriptions().filter(i => i.status === 'active').length
  );

  public readonly completedInscriptions = computed(() =>
    this.inscriptions().filter(i => i.status === 'completed').length
  );

  public readonly cancelledInscriptions = computed(() =>
    this.inscriptions().filter(i => i.status === 'cancelled').length
  );

  constructor() {
    // Load initial data
    this.loadInscriptions();
  }

  /**
   * Load all inscriptions from API
   */
  private loadInscriptions(): void {
    this.http.get<Inscription[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (inscriptions) => {
        this.inscriptionsWritableSignal.set(inscriptions);
      },
      error: (error) => {
        console.error('Error loading inscriptions:', error);
        this.inscriptionsWritableSignal.set([]);
      }
    });
  }

  /**
   * Refresh inscriptions data from API
   */
  refreshInscriptions(): void {
    this.loadInscriptions();
  }

  /**
   * Add a new inscription via API
   */
  addInscription(inscription: CreateInscription): Observable<Inscription> {
    console.log('[InscriptionsService] addInscription called with:', inscription);

    // Validate student exists
    const student = this.studentsService.getStudentById(inscription.studentId);
    if (!student) {
      console.log('[InscriptionsService] Student not found:', inscription.studentId);
      return throwError(() => new Error('Student not found'));
    }

    // Validate course exists and has capacity
    const course = this.coursesService.getCourseById(inscription.courseId);
    if (!course) {
      console.log('[InscriptionsService] Course not found:', inscription.courseId);
      return throwError(() => new Error('Course not found'));
    }

    if (!this.coursesService.canEnroll(inscription.courseId)) {
      console.log('[InscriptionsService] Course at capacity:', course.enrolled, '/', course.capacity);
      return throwError(() => new Error('Course is full'));
    }

    // Check if student is already enrolled in this course
    const existingInscription = this.inscriptions().find(
      i => i.studentId === inscription.studentId &&
           i.courseId === inscription.courseId &&
           (i.status === 'active' || i.status === 'completed')
    );

    if (existingInscription) {
      console.log('[InscriptionsService] Duplicate enrollment detected:', existingInscription);
      return throwError(() => new Error('Student is already enrolled in this course'));
    }

    return this.http.post<Inscription>(this.apiUrl, inscription).pipe(
      switchMap(newInscription => {
        console.log('[InscriptionsService] Inscription created:', newInscription);
        // Update local signal
        this.inscriptionsWritableSignal.update(inscriptions => [...inscriptions, newInscription]);

        // Increment course enrollment and return the inscription
        return this.coursesService.incrementEnrollment(inscription.courseId).pipe(
          tap(() => console.log('[InscriptionsService] Course enrollment incremented')),
          switchMap(() => [newInscription])
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing inscription via API
   */
  updateInscription(id: number, changes: UpdateInscription): Observable<Inscription> {
    console.log('[InscriptionsService] updateInscription called with ID:', id, 'Changes:', changes);

    const currentInscription = this.getInscriptionById(id);

    if (!currentInscription) {
      console.log('[InscriptionsService] Inscription not found with ID:', id);
      return throwError(() => new Error('Inscription not found'));
    }

    console.log('[InscriptionsService] Current inscription:', currentInscription);

    const url = `${this.apiUrl}/${id}`;

    // Determine if we need to adjust enrollment count
    let enrollmentAdjustment$: Observable<any> | null = null;

    // If status is changing from active to cancelled/completed, decrement enrollment
    if (changes.status &&
        currentInscription.status === 'active' &&
        (changes.status === 'cancelled' || changes.status === 'completed')) {
      console.log('[InscriptionsService] Status changing from active, decrementing enrollment');
      enrollmentAdjustment$ = this.coursesService.decrementEnrollment(currentInscription.courseId);
    }

    // If status is changing from cancelled to active, increment enrollment
    if (changes.status &&
        currentInscription.status === 'cancelled' &&
        changes.status === 'active') {
      console.log('[InscriptionsService] Status changing to active, checking capacity');
      if (!this.coursesService.canEnroll(currentInscription.courseId)) {
        console.log('[InscriptionsService] Cannot reactivate - course at capacity');
        return throwError(() => new Error('Cannot reactivate: course is full'));
      }
      enrollmentAdjustment$ = this.coursesService.incrementEnrollment(currentInscription.courseId);
    }

    return this.http.put<Inscription>(url, changes).pipe(
      switchMap(updatedInscription => {
        console.log('[InscriptionsService] Inscription updated:', updatedInscription);
        // Update local signal
        this.inscriptionsWritableSignal.update(inscriptions =>
          inscriptions.map(inscription =>
            inscription.id === id ? { ...inscription, ...updatedInscription } : inscription
          )
        );

        // If we need to adjust enrollment, do it and return the inscription
        if (enrollmentAdjustment$) {
          return enrollmentAdjustment$.pipe(
            switchMap(() => [updatedInscription])
          );
        }

        return [updatedInscription];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete an inscription via API
   */
  deleteInscription(id: number): Observable<void> {
    console.log('[InscriptionsService] deleteInscription called with ID:', id);

    const inscription = this.getInscriptionById(id);

    if (!inscription) {
      return throwError(() => new Error('Inscription not found'));
    }

    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      switchMap(() => {
        console.log('[InscriptionsService] Inscription deleted');
        // Update local signal
        this.inscriptionsWritableSignal.update(inscriptions =>
          inscriptions.filter(i => i.id !== id)
        );

        // If inscription was active, decrement course enrollment
        if (inscription.status === 'active') {
          return this.coursesService.decrementEnrollment(inscription.courseId).pipe(
            switchMap(() => [undefined])
          );
        }

        return [undefined];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get an inscription by ID (from local signal)
   */
  getInscriptionById(id: number): Inscription | undefined {
    return this.inscriptions().find(i => i.id === id);
  }

  /**
   * Get inscriptions by student ID (from local signal)
   */
  getInscriptionsByStudentId(studentId: number): Inscription[] {
    return this.inscriptions().filter(i => i.studentId === studentId);
  }

  /**
   * Get inscriptions by course ID (from local signal)
   */
  getInscriptionsByCourseId(courseId: number): Inscription[] {
    return this.inscriptions().filter(i => i.courseId === courseId);
  }

  /**
   * Get inscriptions by status (from local signal)
   */
  getInscriptionsByStatus(status: InscriptionStatus): Inscription[] {
    return this.inscriptions().filter(i => i.status === status);
  }

  /**
   * Cancel an inscription
   */
  cancelInscription(id: number): Observable<Inscription> {
    return this.updateInscription(id, { status: 'cancelled' });
  }

  /**
   * Complete an inscription
   */
  completeInscription(id: number): Observable<Inscription> {
    return this.updateInscription(id, { status: 'completed' });
  }

  /**
   * Reactivate an inscription
   */
  reactivateInscription(id: number): Observable<Inscription> {
    return this.updateInscription(id, { status: 'active' });
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

    console.error('[InscriptionsService] HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
