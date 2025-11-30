import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { Student } from '../../../core/models/student.interface';
import { AppState } from '../../../store/app.state';
import { selectAllStudents } from '../store/students.selectors';
import { loadStudents } from '../store/students.actions';
import { loadInscriptions } from '../../inscriptions/store/inscriptions.actions';
import { loadCourses } from '../../courses/store/courses.actions';
import { selectEnrichedInscriptions, EnrichedInscription } from '../../inscriptions/store/inscriptions.selectors';
import { deleteInscription } from '../../inscriptions/store/inscriptions.actions';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
})
export class StudentDetailComponent implements OnInit {
  student$!: Observable<Student | undefined>;
  inscriptions$!: Observable<EnrichedInscription[]>;
  displayedColumns = ['courseName', 'courseCode', 'enrollmentDate', 'status', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    // Dispatch load actions
    this.store.dispatch(loadStudents());
    this.store.dispatch(loadInscriptions());
    this.store.dispatch(loadCourses());

    // Get student using combineLatest
    this.student$ = combineLatest([
      this.route.params,
      this.store.select(selectAllStudents)
    ]).pipe(
      map(([params, students]) => {
        const id = params['id'];
        const student = students.find(s => s.id === id);
        return student;
      })
    );

    // Get inscriptions
    this.inscriptions$ = combineLatest([
      this.route.params,
      this.store.select(selectEnrichedInscriptions)
    ]).pipe(
      map(([params, inscriptions]) => {
        const id = Number(params['id']);
        return inscriptions.filter(i => i.studentId === id);
      })
    );
  }

  onUnenroll(inscription: EnrichedInscription): void {
    if (confirm(`Unenroll from ${inscription.courseName}?`)) {
      this.store.dispatch(deleteInscription({ id: inscription.id }));
    }
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': return 'warn';
      default: return '';
    }
  }
}