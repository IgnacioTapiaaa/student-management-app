import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Inscription, CreateInscription, UpdateInscription, InscriptionStatus } from '../models/inscription.interface';
import { CoursesService } from './courses.service';
import { StudentsService } from './students.service';
import { environment } from '../../../environments/environment';
import * as InscriptionsSelectors from '../../features/inscriptions/store/inscriptions.selectors';

/**
 * Inscriptions Service
 * Handles HTTP operations for inscriptions
 * Provides backward compatibility with signal-based API via NGRX Store
 */
@Injectable({
  providedIn: 'root'
})
export class InscriptionsService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private coursesService = inject(CoursesService);
  private studentsService = inject(StudentsService);
  private apiUrl = `${environment.apiUrl}/inscriptions`;

  // Store Observables
  private inscriptions$ = this.store.select(InscriptionsSelectors.selectAllInscriptions);
  private totalInscriptions$ = this.store.select(InscriptionsSelectors.selectTotalInscriptions);

  // Backward compatibility - Signal-based API
  private inscriptionsSignal = toSignal(this.inscriptions$, { initialValue: [] });
  public readonly inscriptions = computed(() => this.inscriptionsSignal());
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

  /**
   * Get all inscriptions from API
   */
  getAll(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add a new inscription via API
   */
  addInscription(inscription: CreateInscription): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing inscription via API
   */
  updateInscription(id: number, changes: UpdateInscription): Observable<Inscription> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Inscription>(url, changes).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete an inscription via API
   */
  deleteInscription(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
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

    return throwError(() => new Error(errorMessage));
  }
}
