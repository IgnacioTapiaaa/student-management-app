import { Component, OnInit, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Student } from '../../core/models/student.interface';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { StudentFormComponent, StudentFormData } from './components/student-form.component';
import { StudentListComponent } from './components/student-list.component';
import { StudentStatsComponent } from './components/student-stats.component';
import * as StudentsActions from './store/students.actions';
import * as StudentsSelectors from './store/students.selectors';

/**
 * Students Component
 * Main container component for students management
 * Uses NGRX Store for state management
 */
@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    FontSizeDirective,
    StudentFormComponent,
    StudentListComponent,
    StudentStatsComponent
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentsComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  // Local UI state
  isEditMode = signal<boolean>(false);
  editingStudent = signal<Student | null>(null);

  // Store selectors - Observable streams
  students$ = this.store.select(StudentsSelectors.selectAllStudents);
  loading$ = this.store.select(StudentsSelectors.selectStudentsLoading);
  error$ = this.store.select(StudentsSelectors.selectStudentsError);
  totalStudents$ = this.store.select(StudentsSelectors.selectTotalStudents);
  averageAge$ = this.store.select(StudentsSelectors.selectAverageAge);

  // View model - combines multiple selectors
  viewModel$ = this.store.select(StudentsSelectors.selectStudentsViewModel);

  // Computed signals for form
  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Student' : 'Add New Student'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Student' : 'Save Student'
  );

  ngOnInit(): void {
    // Dispatch action to load students
    this.store.dispatch(StudentsActions.loadStudents());
  }

  onStudentSubmit(formData: StudentFormData): void {
    if (formData.editingId !== null) {
      this.store.dispatch(StudentsActions.updateStudent({
        id: formData.editingId,
        changes: formData.data
      }));
    } else {
      this.store.dispatch(StudentsActions.addStudent({
        student: formData.data
      }));
    }

    this.resetEditMode();
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditStudent(student: Student): void {
    this.isEditMode.set(true);
    this.editingStudent.set(student);
    this.store.dispatch(StudentsActions.selectStudent({ id: student.id }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.store.dispatch(StudentsActions.deleteStudent({ id: student.id }));

        // Reset edit mode if deleting the currently editing student
        if (this.editingStudent()?.id === student.id) {
          this.resetEditMode();
        }
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingStudent.set(null);
    this.store.dispatch(StudentsActions.clearSelected());
  }
}
