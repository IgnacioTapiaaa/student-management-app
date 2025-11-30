import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, filter, tap, map, shareReplay } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Course } from '../../../core/models/course.interface';
import { ConfirmDialogComponent } from '../../students/confirm-dialog.component';
import { selectAllCourses } from '../store/courses.selectors';
import { selectEnrichedInscriptions } from '../../inscriptions/store/inscriptions.selectors';
import * as InscriptionsActions from '../../inscriptions/store/inscriptions.actions';
import { loadStudents } from '../../students/store/students.actions';
import { loadInscriptions } from '../../inscriptions/store/inscriptions.actions';
import { loadCourses } from '../../courses/store/courses.actions';

/**
 * Course Detail Component
 * Displays detailed information about a specific course and enrolled students
 * Uses NGRX Router Store to get course ID from route params
 */
@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private dialog = inject(MatDialog);

  // Get course ID from route params
  courseId$ = this.route.params.pipe(
    map(params => params['id']),
    filter(id => !isNaN(id)),
    shareReplay(1)
  );

  // Select course from store using combineLatest to wait for data
  course$: Observable<Course | undefined> = combineLatest([
    this.courseId$,
    this.store.select(selectAllCourses)
  ]).pipe(
    map(([id, courses]) => courses.find(c => c.id === id)),
    shareReplay(1)
  );

  // Select course inscriptions from store using combineLatest
  inscriptions$ = combineLatest([
    this.courseId$,
    this.store.select(selectEnrichedInscriptions)
  ]).pipe(
    map(([id, inscriptions]) => inscriptions.filter(i => i.courseId === id))
  );

  displayedColumns = ['studentName', 'studentEmail', 'enrollmentDate', 'status', 'actions'];

  ngOnInit(): void {
    // CRÍTICO: Despachar acciones PRIMERO
    this.store.dispatch(loadCourses());
    this.store.dispatch(loadInscriptions());
    this.store.dispatch(loadStudents());

    // Obtener course desde route params
    this.course$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id =>
        this.store.select(selectAllCourses).pipe(
          map(courses => courses.find(c => c.id === id))
        )
      ),
      filter(course => !!course),
      shareReplay(1)
    );

    // Obtener inscriptions
    this.inscriptions$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id =>
        this.store.select(selectEnrichedInscriptions).pipe(
          map(inscriptions => inscriptions.filter(i => i.courseId === id))
        )
      )
    );
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  onUnenroll(inscription: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unenroll Student',
        message: `Are you sure you want to unenroll ${inscription.studentName} from this course? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.store.dispatch(InscriptionsActions.deleteInscription({ id: inscription.id }));
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getEnrollmentPercentage(course: Course | undefined): number {
    if (!course || course.capacity === 0) return 0;
    return (course.enrolled / course.capacity) * 100;
  }
}
