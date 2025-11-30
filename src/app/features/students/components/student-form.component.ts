import { Component, OnInit, Output, EventEmitter, Input, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateStudent, Student } from '../../../core/models/student.interface';

interface StudentForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  age: FormControl<number | null>;
  email: FormControl<string>;
}

export interface StudentFormData {
  data: CreateStudent;
  editingId: number | null;
}

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit, OnChanges {
  @Input() formTitle: string = 'Add New Student';
  @Input() submitButtonText: string = 'Save Student';
  @Input() studentToEdit: Student | null = null;

  @Output() studentSubmit = new EventEmitter<StudentFormData>();
  @Output() formCancel = new EventEmitter<void>();

  studentForm!: FormGroup<StudentForm>;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentToEdit'] && this.studentToEdit) {
      // Ensure form is initialized before patching
      if (!this.studentForm) {
        this.initializeForm();
      }
      this.loadStudentData(this.studentToEdit);
    }
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

  private loadStudentData(student: Student): void {
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      age: student.age,
      email: student.email
    });
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

    const formData: StudentFormData = {
      data: studentData,
      editingId: this.studentToEdit?.id ?? null
    };

    this.studentSubmit.emit(formData);
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
  }

  resetForm(): void {
    this.studentForm.reset();
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
}
