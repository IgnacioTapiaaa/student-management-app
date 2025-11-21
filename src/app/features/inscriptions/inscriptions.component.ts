import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InscriptionsService } from '../../core/services/inscriptions.service';
import { StudentsService } from '../../core/services/students.service';
import { CoursesService } from '../../core/services/courses.service';
import { Inscription } from '../../core/models/inscription.interface';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from '../students/confirm-dialog.component';
import { InscriptionFormComponent, InscriptionFormData } from './components/inscription-form.component';
import { InscriptionListComponent } from './components/inscription-list.component';
import { InscriptionStatsComponent } from './components/inscription-stats.component';

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    FontSizeDirective,
    InscriptionFormComponent,
    InscriptionListComponent,
    InscriptionStatsComponent
  ],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent {
  isEditMode = signal<boolean>(false);
  editingInscription = signal<Inscription | null>(null);

  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Inscription' : 'Add New Inscription'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Inscription' : 'Save Inscription'
  );

  constructor(
    public inscriptionsService: InscriptionsService,
    public studentsService: StudentsService,
    public coursesService: CoursesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  onInscriptionSubmit(formData: InscriptionFormData): void {
    console.log('[InscriptionsComponent] onInscriptionSubmit called with:', formData);

    if (formData.editingId !== null) {
      console.log('[InscriptionsComponent] Updating inscription with ID:', formData.editingId);
      this.inscriptionsService.updateInscription(
        formData.editingId,
        formData.data
      ).subscribe({
        next: (updatedInscription) => {
          console.log('[InscriptionsComponent] Inscription updated:', updatedInscription);
          this.snackBar.open('Inscription updated successfully', 'Close', {
            duration: 3000
          });
          this.resetEditMode();
        },
        error: (error) => {
          console.error('[InscriptionsComponent] Update error:', error);
          this.snackBar.open('Failed to update inscription', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      console.log('[InscriptionsComponent] Adding new inscription');
      this.inscriptionsService.addInscription(formData.data).subscribe({
        next: (newInscription) => {
          console.log('[InscriptionsComponent] New inscription created:', newInscription);
          this.snackBar.open('Inscription added successfully', 'Close', {
            duration: 3000
          });
          this.resetEditMode();
        },
        error: (error) => {
          console.error('[InscriptionsComponent] Add error:', error);
          this.snackBar.open('Failed to add inscription. Please check course capacity and duplicate enrollments.', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditInscription(inscription: Inscription): void {
    this.isEditMode.set(true);
    this.editingInscription.set(inscription);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteInscription(inscription: Inscription): void {
    const student = this.studentsService.getStudentById(inscription.studentId);
    const course = this.coursesService.getCourseById(inscription.courseId);

    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    const courseName = course ? course.name : 'Unknown Course';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the inscription for "${studentName}" in "${courseName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.inscriptionsService.deleteInscription(inscription.id).subscribe({
          next: () => {
            this.snackBar.open('Inscription deleted successfully', 'Close', {
              duration: 3000
            });

            if (this.editingInscription()?.id === inscription.id) {
              this.resetEditMode();
            }
          },
          error: (error) => {
            console.error('[InscriptionsComponent] Delete error:', error);
            this.snackBar.open('Failed to delete inscription', 'Close', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  onCancelInscription(inscription: Inscription): void {
    if (inscription.status !== 'active') {
      this.snackBar.open('Only active inscriptions can be cancelled', 'Close', {
        duration: 3000
      });
      return;
    }

    const student = this.studentsService.getStudentById(inscription.studentId);
    const course = this.coursesService.getCourseById(inscription.courseId);

    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    const courseName = course ? course.name : 'Unknown Course';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Cancellation',
        message: `Are you sure you want to cancel the inscription for "${studentName}" in "${courseName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.inscriptionsService.cancelInscription(inscription.id).subscribe({
          next: () => {
            this.snackBar.open('Inscription cancelled successfully', 'Close', {
              duration: 3000
            });

            if (this.editingInscription()?.id === inscription.id) {
              this.resetEditMode();
            }
          },
          error: (error) => {
            console.error('[InscriptionsComponent] Cancel error:', error);
            this.snackBar.open('Failed to cancel inscription', 'Close', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingInscription.set(null);
  }
}
