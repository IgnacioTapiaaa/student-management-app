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
      const success = this.coursesService.updateCourse(
        formData.editingId,
        formData.data
      );
      console.log('[CoursesComponent] Update result:', success);

      if (success) {
        this.snackBar.open('Course updated successfully', 'Close', {
          duration: 3000
        });
        this.resetEditMode();
      } else {
        this.snackBar.open('Failed to update course', 'Close', {
          duration: 3000
        });
      }
    } else {
      console.log('[CoursesComponent] Adding new course');
      const newCourse = this.coursesService.addCourse(formData.data);
      console.log('[CoursesComponent] New course created:', newCourse);
      this.snackBar.open('Course added successfully', 'Close', {
        duration: 3000
      });
      this.resetEditMode();
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
        const success = this.coursesService.deleteCourse(course.id);

        if (success) {
          this.snackBar.open('Course deleted successfully', 'Close', {
            duration: 3000
          });

          if (this.editingCourse()?.id === course.id) {
            this.resetEditMode();
          }
        } else {
          this.snackBar.open('Failed to delete course', 'Close', {
            duration: 3000
          });
        }
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingCourse.set(null);
  }
}
