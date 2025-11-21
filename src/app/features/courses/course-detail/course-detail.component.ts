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
import { CoursesService } from '../../../core/services/courses.service';
import { InscriptionsService } from '../../../core/services/inscriptions.service';
import { StudentsService } from '../../../core/services/students.service';
import { Course } from '../../../core/models/course.interface';
import { Inscription } from '../../../core/models/inscription.interface';
import { Student } from '../../../core/models/student.interface';
import { ConfirmDialogComponent } from '../../students/confirm-dialog.component';

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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private inscriptionsService = inject(InscriptionsService);
  private studentsService = inject(StudentsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  courseId = signal<number | null>(null);
  courses = this.coursesService.courses;

  course = computed(() => {
    const id = this.courseId();
    const courses = this.courses();
    if (!id) return undefined;
    return courses.find(c => c.id == id);
  });

  enrolledStudents = computed(() => {
    const id = this.courseId();
    if (!id) return [];
    const inscriptions = this.inscriptionsService.inscriptions().filter(i => i.courseId == id);
    return inscriptions.map(inscription => {
      const student = this.studentsService.students().find(s => s.id == inscription.studentId);
      return { ...inscription, student };
    });
  });

  displayedColumns = ['studentName', 'studentEmail', 'enrollmentDate', 'status', 'actions'];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!isNaN(id)) {
        this.courseId.set(id);
      } else {
        this.router.navigate(['/courses']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  onUnenroll(inscription: Inscription & { student?: Student }): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unenroll Student',
        message: `Are you sure you want to unenroll ${inscription.student?.firstName} ${inscription.student?.lastName} from this course? This action cannot be undone.`
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
            console.error('[CourseDetailComponent] Unenroll error:', error);
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

  getStudentName(student?: Student): string {
    if (!student) return 'N/A';
    return `${student.firstName} ${student.lastName}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getEnrollmentPercentage(): number {
    const course = this.course();
    if (!course || course.capacity === 0) return 0;
    return (course.enrolled / course.capacity) * 100;
  }
}
