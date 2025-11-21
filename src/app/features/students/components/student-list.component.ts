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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Student } from '../../../core/models/student.interface';
import { FullNamePipe } from '../../../core/pipes/full-name.pipe';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-student-list',
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
    MatTooltipModule,
    FullNamePipe
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() students: Student[] = [];

  @Output() editStudent = new EventEmitter<Student>();
  @Output() deleteStudent = new EventEmitter<Student>();

  dataSource = new MatTableDataSource<Student>([]);
  displayedColumns: string[] = ['id', 'fullName', 'age', 'email', 'actions'];

  // Admin check
  isAdmin = this.authService.isAdmin;

  constructor() { }

  ngOnInit(): void {
    this.dataSource.data = this.students;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['students']) {
      this.dataSource.data = this.students;
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

  onEdit(student: Student): void {
    this.editStudent.emit(student);
  }

  onDelete(student: Student): void {
    this.deleteStudent.emit(student);
  }

  onViewDetails(student: Student): void {
    this.router.navigate(['/students', student.id]);
  }

  trackByStudentId(index: number, student: Student): number {
    return student.id;
  }
}
