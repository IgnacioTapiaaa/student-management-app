import { Component, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CreateInscription, Inscription, InscriptionStatus } from '../../../core/models/inscription.interface';
import { StudentsService } from '../../../core/services/students.service';
import { CoursesService } from '../../../core/services/courses.service';
import { InscriptionsService } from '../../../core/services/inscriptions.service';
import { FullNamePipe } from '../../../core/pipes/full-name.pipe';

interface InscriptionForm {
  studentId: FormControl<number | null>;
  courseId: FormControl<number | null>;
  enrollmentDate: FormControl<Date | null>;
  status: FormControl<InscriptionStatus>;
}

export interface InscriptionFormData {
  data: CreateInscription;
  editingId: number | null;
}

@Component({
  selector: 'app-inscription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FullNamePipe
  ],
  templateUrl: './inscription-form.component.html',
  styleUrls: ['./inscription-form.component.scss']
})
export class InscriptionFormComponent implements OnInit, OnChanges {
  @Input() formTitle: string = 'Add New Inscription';
  @Input() submitButtonText: string = 'Save Inscription';
  @Input() inscriptionToEdit: Inscription | null = null;

  @Output() inscriptionSubmit = new EventEmitter<InscriptionFormData>();
  @Output() formCancel = new EventEmitter<void>();

  inscriptionForm!: FormGroup<InscriptionForm>;

  studentsService = inject(StudentsService);
  coursesService = inject(CoursesService);
  inscriptionsService = inject(InscriptionsService);

  statusOptions: { value: InscriptionStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  formErrors: string[] = [];

  // compareWith function for mat-select to handle type mismatches
  compareIds = (a: any, b: any): boolean => {
    if (a == null || b == null) return false;
    return a.toString() === b.toString();
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    // Load initial data if provided
    if (this.inscriptionToEdit) {
      this.loadInscriptionData(this.inscriptionToEdit);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in inscriptionToEdit Input
    if (changes['inscriptionToEdit'] && !changes['inscriptionToEdit'].firstChange) {
      if (this.inscriptionToEdit && this.inscriptionForm) {
        this.loadInscriptionData(this.inscriptionToEdit);
      } else if (!this.inscriptionToEdit && this.inscriptionForm) {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.inscriptionForm = this.fb.group<InscriptionForm>({
      studentId: this.fb.control<number | null>(null, {
        validators: [Validators.required]
      }),
      courseId: this.fb.control<number | null>(null, {
        validators: [Validators.required]
      }),
      enrollmentDate: this.fb.control<Date | null>(new Date(), {
        validators: [Validators.required]
      }),
      status: this.fb.control<InscriptionStatus>('active', {
        validators: [Validators.required],
        nonNullable: true
      })
    });
  }

  private loadInscriptionData(inscription: Inscription): void {
    // Convert enrollmentDate to Date object if it's a string
    const enrollmentDate = inscription.enrollmentDate instanceof Date
      ? inscription.enrollmentDate
      : new Date(inscription.enrollmentDate);

    this.inscriptionForm.patchValue({
      studentId: inscription.studentId,
      courseId: inscription.courseId,
      enrollmentDate: enrollmentDate,
      status: inscription.status
    });
  }

  onSubmit(): void {
    this.formErrors = [];

    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
      return;
    }

    const formValue = this.inscriptionForm.getRawValue();

    // Validation: Check if student exists
    const student = this.studentsService.getStudentById(formValue.studentId!);
    if (!student) {
      this.formErrors.push('Selected student does not exist');
      return;
    }

    // Validation: Check if course exists
    const course = this.coursesService.getCourseById(formValue.courseId!);
    if (!course) {
      this.formErrors.push('Selected course does not exist');
      return;
    }

    // Validation: Check course capacity (only for new inscriptions or status change to active)
    if (!this.inscriptionToEdit ||
        (this.inscriptionToEdit.status !== 'active' && formValue.status === 'active')) {
      if (!this.coursesService.canEnroll(formValue.courseId!)) {
        this.formErrors.push(`Course "${course.name}" is at full capacity (${course.enrolled}/${course.capacity})`);
        return;
      }
    }

    // Validation: Check for duplicate enrollment (only for new inscriptions)
    if (!this.inscriptionToEdit) {
      const existingInscription = this.inscriptionsService.getInscriptionsByStudentId(formValue.studentId!)
        .find(i =>
          i.courseId === formValue.courseId! &&
          (i.status === 'active' || i.status === 'completed')
        );

      if (existingInscription) {
        this.formErrors.push(`Student "${student.firstName} ${student.lastName}" is already enrolled in "${course.name}"`);
        return;
      }
    }

    const inscriptionData: CreateInscription = {
      studentId: formValue.studentId!,
      courseId: formValue.courseId!,
      enrollmentDate: formValue.enrollmentDate ?? new Date(),
      status: formValue.status
    };

    const formData: InscriptionFormData = {
      data: inscriptionData,
      editingId: this.inscriptionToEdit?.id ?? null
    };

    this.inscriptionSubmit.emit(formData);
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
  }

  resetForm(): void {
    this.inscriptionForm.reset({
      enrollmentDate: new Date(),
      status: 'active'
    });
    this.formErrors = [];
  }

  getErrorMessage(fieldName: keyof InscriptionForm): string {
    const control = this.inscriptionForm.controls[fieldName];

    if (control.hasError('required')) {
      return 'This field is required';
    }

    return '';
  }

  getAvailableSeats(courseId: number): string {
    const course = this.coursesService.getCourseById(courseId);
    if (!course) return '';
    const available = course.capacity - course.enrolled;
    return `${available} seat${available !== 1 ? 's' : ''} available`;
  }
}
