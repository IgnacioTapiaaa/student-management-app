import { Component, OnInit, ViewChild, Input, Output, EventEmitter, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Inscription } from '../../../core/models/inscription.interface';
import { StudentsService } from '../../../core/services/students.service';
import { CoursesService } from '../../../core/services/courses.service';

interface InscriptionTableRow {
  id: number;
  studentName: string;
  courseName: string;
  courseCode: string;
  enrollmentDate: Date;
  status: string;
  originalInscription: Inscription;
}

@Component({
  selector: 'app-inscription-list',
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
    MatChipsModule
  ],
  templateUrl: './inscription-list.component.html',
  styleUrls: ['./inscription-list.component.scss']
})
export class InscriptionListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() inscriptions: Inscription[] = [];

  @Output() editInscription = new EventEmitter<Inscription>();
  @Output() deleteInscription = new EventEmitter<Inscription>();
  @Output() cancelInscription = new EventEmitter<Inscription>();

  studentsService = inject(StudentsService);
  coursesService = inject(CoursesService);

  dataSource = new MatTableDataSource<InscriptionTableRow>([]);
  displayedColumns: string[] = ['id', 'studentName', 'courseName', 'courseCode', 'enrollmentDate', 'status', 'actions'];

  constructor() {
    effect(() => {
      this.updateTableData();
    });
  }

  ngOnInit(): void {
    this.updateTableData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter to search by student name or course name
    this.dataSource.filterPredicate = (data: InscriptionTableRow, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.studentName.toLowerCase().includes(searchStr) ||
             data.courseName.toLowerCase().includes(searchStr) ||
             data.courseCode.toLowerCase().includes(searchStr);
    };
  }

  private updateTableData(): void {
    const tableData: InscriptionTableRow[] = this.inscriptions.map(inscription => {
      const student = this.studentsService.getStudentById(inscription.studentId);
      const course = this.coursesService.getCourseById(inscription.courseId);

      return {
        id: inscription.id,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        courseName: course ? course.name : 'Unknown Course',
        courseCode: course ? course.code : 'N/A',
        enrollmentDate: inscription.enrollmentDate,
        status: inscription.status,
        originalInscription: inscription
      };
    });

    this.dataSource.data = tableData;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(row: InscriptionTableRow): void {
    this.editInscription.emit(row.originalInscription);
  }

  onDelete(row: InscriptionTableRow): void {
    this.deleteInscription.emit(row.originalInscription);
  }

  onCancel(row: InscriptionTableRow): void {
    this.cancelInscription.emit(row.originalInscription);
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return 'primary';
    }
  }

  canCancelInscription(status: string): boolean {
    return status === 'active';
  }

  trackByInscriptionId(index: number, row: InscriptionTableRow): number {
    return row.id;
  }
}
