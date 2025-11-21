import { Component, OnInit, ViewChild, Input, Output, EventEmitter, effect, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Course } from '../../../core/models/course.interface';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})
export class CourseListComponent implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() courses: Course[] = [];

  @Output() editCourse = new EventEmitter<Course>();
  @Output() deleteCourse = new EventEmitter<Course>();

  dataSource = new MatTableDataSource<Course>([]);
  displayedColumns: string[] = ['id', 'name', 'code', 'instructor', 'duration', 'enrollment', 'startDate', 'actions'];

  // Admin check
  isAdmin = this.authService.isAdmin;

  constructor() { }

  ngOnInit(): void {
    this.dataSource.data = this.courses;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courses']) {
      this.dataSource.data = this.courses;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(course: Course): void {
    this.editCourse.emit(course);
  }

  onDelete(course: Course): void {
    this.deleteCourse.emit(course);
  }

  onViewDetails(course: Course): void {
    this.router.navigate(['/courses', course.id]);
  }

  getEnrollmentPercentage(course: Course): number {
    if (course.capacity === 0) return 0;
    return (course.enrolled / course.capacity) * 100;
  }

  getEnrollmentColor(course: Course): string {
    const percentage = this.getEnrollmentPercentage(course);
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  trackByCourseId(index: number, course: Course): number {
    return course.id;
  }
}
