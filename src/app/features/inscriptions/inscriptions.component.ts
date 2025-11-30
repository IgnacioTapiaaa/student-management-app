import { Component, OnInit, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Inscription } from '../../core/models/inscription.interface';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from '../students/confirm-dialog.component';
import { InscriptionFormComponent, InscriptionFormData } from './components/inscription-form.component';
import { InscriptionListComponent } from './components/inscription-list.component';
import { InscriptionStatsComponent } from './components/inscription-stats.component';
import * as InscriptionsActions from './store/inscriptions.actions';
import * as InscriptionsSelectors from './store/inscriptions.selectors';
import * as StudentsActions from '../students/store/students.actions';
import * as CoursesActions from '../courses/store/courses.actions';

/**
 * Inscriptions Component
 * Main container component for inscriptions management
 * Uses NGRX Store for state management
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-inscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    FontSizeDirective,
    InscriptionFormComponent,
    InscriptionListComponent,
    InscriptionStatsComponent
  ],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  // Local UI state
  isEditMode = signal<boolean>(false);
  editingInscription = signal<Inscription | null>(null);

  // Store selectors - Observable streams
  inscriptions$ = this.store.select(InscriptionsSelectors.selectEnrichedInscriptions);
  loading$ = this.store.select(InscriptionsSelectors.selectInscriptionsLoading);
  error$ = this.store.select(InscriptionsSelectors.selectInscriptionsError);
  totalInscriptions$ = this.store.select(InscriptionsSelectors.selectTotalInscriptions);
  activeInscriptions$ = this.store.select(InscriptionsSelectors.selectTotalActiveInscriptions);

  // View model - combines multiple selectors
  viewModel$ = this.store.select(InscriptionsSelectors.selectInscriptionsViewModel);

  // Computed signals for form
  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Inscription' : 'Add New Inscription'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Inscription' : 'Save Inscription'
  );

  ngOnInit(): void {
    // Dispatch actions to load all related data
    this.store.dispatch(InscriptionsActions.loadInscriptions());
    this.store.dispatch(StudentsActions.loadStudents());
    this.store.dispatch(CoursesActions.loadCourses());
  }

  onInscriptionSubmit(formData: InscriptionFormData): void {
    if (formData.editingId !== null) {
      this.store.dispatch(InscriptionsActions.updateInscription({
        id: formData.editingId,
        changes: formData.data
      }));
    } else {
      this.store.dispatch(InscriptionsActions.addInscription({
        inscription: formData.data
      }));
    }

    this.resetEditMode();
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditInscription(inscription: Inscription): void {
    this.isEditMode.set(true);
    this.editingInscription.set(inscription);
    this.store.dispatch(InscriptionsActions.selectInscription({ id: inscription.id }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteInscription(inscription: Inscription): void {
    const enrichedInscription = inscription as InscriptionsSelectors.EnrichedInscription;
    const studentName = enrichedInscription.studentName || 'Unknown Student';
    const courseName = enrichedInscription.courseName || 'Unknown Course';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the inscription for "${studentName}" in "${courseName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.store.dispatch(InscriptionsActions.deleteInscription({ id: inscription.id }));

        // Reset edit mode if deleting the currently editing inscription
        if (this.editingInscription()?.id === inscription.id) {
          this.resetEditMode();
        }
      }
    });
  }

  onCancelInscription(inscription: Inscription): void {
    if (inscription.status !== 'active') {
      return; // The effect will handle the error notification
    }

    const enrichedInscription = inscription as InscriptionsSelectors.EnrichedInscription;
    const studentName = enrichedInscription.studentName || 'Unknown Student';
    const courseName = enrichedInscription.courseName || 'Unknown Course';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Cancellation',
        message: `Are you sure you want to cancel the inscription for "${studentName}" in "${courseName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.store.dispatch(InscriptionsActions.cancelInscription({ id: inscription.id }));

        // Reset edit mode if cancelling the currently editing inscription
        if (this.editingInscription()?.id === inscription.id) {
          this.resetEditMode();
        }
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingInscription.set(null);
    this.store.dispatch(InscriptionsActions.clearSelected());
  }
}
