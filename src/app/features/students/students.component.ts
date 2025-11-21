import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentsService } from '../../core/services/students.service';
import { Student } from '../../core/models/student.interface';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { StudentFormComponent, StudentFormData } from './components/student-form.component';
import { StudentListComponent } from './components/student-list.component';
import { StudentStatsComponent } from './components/student-stats.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    FontSizeDirective,
    StudentFormComponent,
    StudentListComponent,
    StudentStatsComponent
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent {
  isEditMode = signal<boolean>(false);
  editingStudent = signal<Student | null>(null);

  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Student' : 'Add New Student'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Student' : 'Save Student'
  );

  constructor(
    public studentsService: StudentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  onStudentSubmit(formData: StudentFormData): void {
    console.log('[StudentsComponent] onStudentSubmit called with:', formData);

    if (formData.editingId !== null) {
      console.log('[StudentsComponent] Updating student with ID:', formData.editingId);
      this.studentsService.updateStudent(
        formData.editingId,
        formData.data
      ).subscribe({
        next: (updatedStudent) => {
          console.log('[StudentsComponent] Student updated:', updatedStudent);
          this.snackBar.open('Student updated successfully', 'Close', {
            duration: 3000
          });
          this.resetEditMode();
        },
        error: (error) => {
          console.error('[StudentsComponent] Update error:', error);
          this.snackBar.open('Failed to update student', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      console.log('[StudentsComponent] Adding new student');
      this.studentsService.addStudent(formData.data).subscribe({
        next: (newStudent) => {
          console.log('[StudentsComponent] New student created:', newStudent);
          this.snackBar.open('Student added successfully', 'Close', {
            duration: 3000
          });
          this.resetEditMode();
        },
        error: (error) => {
          console.error('[StudentsComponent] Add error:', error);
          this.snackBar.open('Failed to add student', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditStudent(student: Student): void {
    this.isEditMode.set(true);
    this.editingStudent.set(student);
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
        this.studentsService.deleteStudent(student.id).subscribe({
          next: () => {
            this.snackBar.open('Student deleted successfully', 'Close', {
              duration: 3000
            });

            if (this.editingStudent()?.id === student.id) {
              this.resetEditMode();
            }
          },
          error: (error) => {
            console.error('[StudentsComponent] Delete error:', error);
            this.snackBar.open('Failed to delete student', 'Close', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingStudent.set(null);
  }
}
