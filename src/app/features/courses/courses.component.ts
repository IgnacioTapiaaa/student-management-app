import { Component, OnInit, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Course } from '../../core/models/course.interface';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from '../students/confirm-dialog.component';
import { CourseFormComponent, CourseFormData } from './components/course-form.component';
import { CourseListComponent } from './components/course-list.component';
import { CourseStatsComponent } from './components/course-stats.component';
import * as CoursesActions from './store/courses.actions';
import * as CoursesSelectors from './store/courses.selectors';

/**
 * Courses Component
 * Main container component for courses management
 * Uses NGRX Store for state management
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    FontSizeDirective,
    CourseFormComponent,
    CourseListComponent,
    CourseStatsComponent
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  // Local UI state
  isEditMode = signal<boolean>(false);
  editingCourse = signal<Course | null>(null);

  // Store selectors - Observable streams
  courses$ = this.store.select(CoursesSelectors.selectAllCourses);
  loading$ = this.store.select(CoursesSelectors.selectCoursesLoading);
  error$ = this.store.select(CoursesSelectors.selectCoursesError);
  totalCourses$ = this.store.select(CoursesSelectors.selectTotalCourses);
  averageEnrollment$ = this.store.select(CoursesSelectors.selectAverageEnrollment);

  // View model - combines multiple selectors
  viewModel$ = this.store.select(CoursesSelectors.selectCoursesViewModel);

  // Computed signals for form
  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Course' : 'Add New Course'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Course' : 'Save Course'
  );

  ngOnInit(): void {
    // Dispatch action to load courses
    this.store.dispatch(CoursesActions.loadCourses());
  }

  onCourseSubmit(formData: CourseFormData): void {
    if (formData.editingId !== null) {
      this.store.dispatch(CoursesActions.updateCourse({
        id: formData.editingId,
        changes: formData.data
      }));
    } else {
      this.store.dispatch(CoursesActions.addCourse({
        course: formData.data
      }));
    }

    this.resetEditMode();
  }

  onFormCancel(): void {
    this.resetEditMode();
  }

  onEditCourse(course: Course): void {
    this.isEditMode.set(true);
    this.editingCourse.set(course);
    this.store.dispatch(CoursesActions.selectCourse({ id: course.id }));
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
        this.store.dispatch(CoursesActions.deleteCourse({ id: course.id }));

        // Reset edit mode if deleting the currently editing course
        if (this.editingCourse()?.id === course.id) {
          this.resetEditMode();
        }
      }
    });
  }

  private resetEditMode(): void {
    this.isEditMode.set(false);
    this.editingCourse.set(null);
    this.store.dispatch(CoursesActions.clearSelected());
  }
}
