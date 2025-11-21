import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StudentsService } from '../../../core/services/students.service';
import { InscriptionsService } from '../../../core/services/inscriptions.service';
import { CoursesService } from '../../../core/services/courses.service';
import { Student } from '../../../core/models/student.interface';
import { Inscription } from '../../../core/models/inscription.interface';
import { Course } from '../../../core/models/course.interface';
import { ConfirmDialogComponent } from '../confirm-dialog.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentsService = inject(StudentsService);
  private inscriptionsService = inject(InscriptionsService);
  private coursesService = inject(CoursesService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  studentId = signal<number | null>(null);
  students = this.studentsService.students;

  student = computed(() => {
    const id = this.studentId();
    if (!id) return undefined;
    return this.students().find(s => s.id == id);
  });

  studentInscriptions = computed(() => {
    const id = this.studentId();
    if (!id) return [];
    const inscriptions = this.inscriptionsService.inscriptions().filter(i => i.studentId == id);
    return inscriptions.map(inscription => {
      const course = this.coursesService.courses().find(c => c.id == inscription.courseId);
      return { ...inscription, course };
    });
  });

  displayedColumns = ['courseName', 'courseCode', 'enrollmentDate', 'status', 'actions'];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!isNaN(id)) {
        this.studentId.set(id);
      } else {
        this.router.navigate(['/students']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }

  onUnenroll(inscription: Inscription & { course?: Course }): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unenroll from Course',
        message: `Are you sure you want to unenroll ${this.student()?.firstName} from "${inscription.course?.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inscriptionsService.deleteInscription(inscription.id).subscribe({
          next: () => {
            this.snackBar.open('Student unenrolled successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          },
          error: (error) => {
            console.error('[StudentDetailComponent] Unenroll error:', error);
            this.snackBar.open('Failed to unenroll student', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        });
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
}
