import { Component, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CreateCourse, Course } from '../../../core/models/course.interface';

interface CourseForm {
  name: FormControl<string>;
  code: FormControl<string>;
  instructor: FormControl<string>;
  duration: FormControl<number | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  capacity: FormControl<number | null>;
  enrolled: FormControl<number | null>;
}

export interface CourseFormData {
  data: CreateCourse;
  editingId: number | null;
}

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit, OnChanges {
  @Input() formTitle: string = 'Add New Course';
  @Input() submitButtonText: string = 'Save Course';
  @Input() courseToEdit: Course | null = null;

  @Output() courseSubmit = new EventEmitter<CourseFormData>();
  @Output() formCancel = new EventEmitter<void>();

  courseForm!: FormGroup<CourseForm>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    // Load initial data if provided
    if (this.courseToEdit) {
      this.loadCourseData(this.courseToEdit);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in courseToEdit Input
    if (changes['courseToEdit'] && !changes['courseToEdit'].firstChange) {
      if (this.courseToEdit && this.courseForm) {
        this.loadCourseData(this.courseToEdit);
      } else if (!this.courseToEdit && this.courseForm) {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.courseForm = this.fb.group<CourseForm>({
      name: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ],
        nonNullable: true
      }),
      code: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Z0-9-]+$/)
        ],
        nonNullable: true
      }),
      instructor: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ],
        nonNullable: true
      }),
      duration: this.fb.control<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(200)
        ]
      }),
      startDate: this.fb.control<Date | null>(null, {
        validators: [Validators.required]
      }),
      endDate: this.fb.control<Date | null>(null, {
        validators: [Validators.required]
      }),
      capacity: this.fb.control<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(5),
          Validators.max(100)
        ]
      }),
      enrolled: this.fb.control<number | null>(0, {
        validators: [
          Validators.min(0)
        ]
      })
    }, {
      validators: this.dateRangeValidator
    });
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;

    if (startDate && endDate && startDate >= endDate) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  private loadCourseData(course: Course): void {
    // Convert dates to Date objects if they're strings
    const startDate = course.startDate instanceof Date
      ? course.startDate
      : new Date(course.startDate);

    const endDate = course.endDate instanceof Date
      ? course.endDate
      : new Date(course.endDate);

    this.courseForm.patchValue({
      name: course.name,
      code: course.code,
      instructor: course.instructor,
      duration: course.duration,
      startDate: startDate,
      endDate: endDate,
      capacity: course.capacity,
      enrolled: course.enrolled
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const formValue = this.courseForm.getRawValue();

    const courseData: CreateCourse = {
      name: formValue.name,
      code: formValue.code,
      instructor: formValue.instructor,
      duration: formValue.duration ?? 0,
      startDate: formValue.startDate ?? new Date(),
      endDate: formValue.endDate ?? new Date(),
      capacity: formValue.capacity ?? 0,
      enrolled: formValue.enrolled ?? 0
    };

    const formData: CourseFormData = {
      data: courseData,
      editingId: this.courseToEdit?.id ?? null
    };

    this.courseSubmit.emit(formData);
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
  }

  resetForm(): void {
    this.courseForm.reset({ enrolled: 0 });
  }

  getErrorMessage(fieldName: keyof CourseForm): string {
    const control = this.courseForm.controls[fieldName];

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

    if (control.hasError('pattern')) {
      return 'Code must contain only uppercase letters, numbers, and hyphens';
    }

    return '';
  }

  getFormError(): string {
    if (this.courseForm.hasError('dateRangeInvalid')) {
      return 'End date must be after start date';
    }
    return '';
  }
}
