import { Component, OnInit, ViewChild, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentsService } from '../../core/services/students.service';
import { Student, CreateStudent } from '../../core/models/student.interface';
import { FullNamePipe } from '../../core/pipes/full-name.pipe';
import { FontSizeDirective } from '../../shared/directives/font-size.directive';
import { ConfirmDialogComponent } from './confirm-dialog.component';

interface StudentForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  age: FormControl<number | null>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    FullNamePipe,
    FontSizeDirective
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  studentForm!: FormGroup<StudentForm>;

  dataSource = new MatTableDataSource<Student>([]);

  displayedColumns: string[] = ['id', 'fullName', 'age', 'email', 'actions'];

  isEditMode = signal<boolean>(false);

  editingStudentId = signal<number | null>(null);

  formTitle = computed(() =>
    this.isEditMode() ? 'Edit Student' : 'Add New Student'
  );

  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update Student' : 'Save Student'
  );

  constructor(
    private fb: FormBuilder,
    public studentsService: StudentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    effect(() => {
      this.dataSource.data = this.studentsService.students();
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.dataSource.data = this.studentsService.students();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initializeForm(): void {
    this.studentForm = this.fb.group<StudentForm>({
      firstName: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ],
        nonNullable: true
      }),
      lastName: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ],
        nonNullable: true
      }),
      age: this.fb.control<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(10),
          Validators.max(100)
        ]
      }),
      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.email
        ],
        nonNullable: true
      })
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.getRawValue();
    const studentData: CreateStudent = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      age: formValue.age ?? 0,
      email: formValue.email
    };

    if (this.isEditMode() && this.editingStudentId() !== null) {
      const success = this.studentsService.updateStudent(
        this.editingStudentId()!,
        studentData
      );

      if (success) {
        this.snackBar.open('Student updated successfully', 'Close', {
          duration: 3000
        });
        this.resetForm();
      } else {
        this.snackBar.open('Failed to update student', 'Close', {
          duration: 3000
        });
      }
    } else {
      this.studentsService.addStudent(studentData);
      this.snackBar.open('Student added successfully', 'Close', {
        duration: 3000
      });
      this.resetForm();
    }
  }

  onEdit(student: Student): void {
    this.isEditMode.set(true);
    this.editingStudentId.set(student.id);

    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      age: student.age,
      email: student.email
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDelete(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const success = this.studentsService.deleteStudent(student.id);

        if (success) {
          this.snackBar.open('Student deleted successfully', 'Close', {
            duration: 3000
          });

          if (this.editingStudentId() === student.id) {
            this.resetForm();
          }
        } else {
          this.snackBar.open('Failed to delete student', 'Close', {
            duration: 3000
          });
        }
      }
    });
  }

  onCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.studentForm.reset();
    this.isEditMode.set(false);
    this.editingStudentId.set(null);
  }

  getErrorMessage(fieldName: keyof StudentForm): string {
    const control = this.studentForm.controls[fieldName];

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum length is ${minLength} characters`;
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }

    if (control.hasError('min')) {
      const min = control.getError('min').min;
      return `Minimum value is ${min}`;
    }

    if (control.hasError('max')) {
      const max = control.getError('max').max;
      return `Maximum value is ${max}`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  trackByStudentId(index: number, student: Student): number {
    return student.id;
  }
}
