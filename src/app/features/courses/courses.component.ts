import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CoursesService } from '../../core/services/courses.service';
import { Course } from '../../core/models/course.interface';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from '../students/confirm-dialog.component';
import { CourseFormComponent, CourseFormData } from './components/course-form.component';
import { CourseListComponent } from './components/course-list.component';
import { CourseStatsComponent } from './components/course-stats.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    FontSizeDirective,
    CourseFormComponent,
    CourseListComponent,
    CourseStatsComponent
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {
  isEditMode = signal<boolean>(false);
  editingCourse = signal<Course | null>(null);

  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Course' : 'Add New Course'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Course' : 'Save Course'
  );

  constructor(
    public coursesService: CoursesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  onCourseSubmit(formData: CourseFormData): void {
    console.log('[CoursesComponent] onCourseSubmit called with:', formData);

    if (formData.editingId !== null) {
      console.log('[CoursesComponent] Updating course with ID:', formData.editingId);
      this.coursesService.updateCourse(
        formData.editingId,
        formData.data
      ).subscribe({
        next: (updatedCourse) => {
          console.log('[CoursesComponent] Course updated:', updatedCourse);
          this.snackBar.open('Course updated successfully', 'Close', {
            duration: 3000
          });
          this.resetEditMode();
        },
        error: (error) => {
          console.error('[CoursesComponent] Update error:', error);
          this.snackBar.open('Failed to update course', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      console.log('[CoursesComponent] Adding new course');
      this.coursesService.addCourse(formData.data).subscribe({
        next: (newCourse) => {
          console.log('[CoursesComponent] New course created:', newCourse);
          this.snackBar.open('Course added successfully', 'Close', {
            duration: 3000
          });
          this.resetEditMode();
        },
        error: (error) => {
          console.error('[CoursesComponent] Add error:', error);
          this.snackBar.open('Failed to add course', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditCourse(course: Course): void {
    this.isEditMode.set(true);
    this.editingCourse.set(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteCourse(course: Course): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${course.name}" (${course.code})?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.coursesService.deleteCourse(course.id).subscribe({
          next: () => {
            this.snackBar.open('Course deleted successfully', 'Close', {
              duration: 3000
            });

            if (this.editingCourse()?.id === course.id) {
              this.resetEditMode();
            }
          },
          error: (error) => {
            console.error('[CoursesComponent] Delete error:', error);
            this.snackBar.open('Failed to delete course', 'Close', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingCourse.set(null);
  }
}
