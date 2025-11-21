import { Component, Input, Output, EventEmitter, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { User, CreateUser, UserRole } from '../../../../core/models/user.interface';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  @Input() formTitle = 'Add New User';
  @Input() submitButtonText = 'Add User';
  @Input() userToEdit?: User;

  @Output() userSubmit = new EventEmitter<CreateUser>();
  @Output() formCancel = new EventEmitter<void>();

  userForm!: FormGroup;
  showChangePassword = signal(false);
  hidePassword = signal(true);
  isEditMode = false;

  roles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Regular User' }
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();

    // Effect to load user data when userToEdit changes
    effect(() => {
      if (this.userToEdit) {
        this.isEditMode = true;
        this.loadUserData(this.userToEdit);
      }
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.userToEdit;
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      role: ['user', [Validators.required]],
      changePassword: [false]
    });
  }

  private loadUserData(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      changePassword: false
    });

    // In edit mode, password is not required by default
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValue('');
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onChangePasswordToggle(): void {
    const changePassword = this.userForm.get('changePassword')?.value;
    this.showChangePassword.set(changePassword);

    const passwordControl = this.userForm.get('password');
    if (changePassword) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
    }
    passwordControl?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    const formValue = this.userForm.value;
    const userData: CreateUser = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: formValue.role,
      password: formValue.password || this.userToEdit?.password || ''
    };

    this.userSubmit.emit(userData);
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
  }

  private resetForm(): void {
    this.userForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      changePassword: false
    });
    this.showChangePassword.set(false);
    this.isEditMode = false;

    // Reset password validators for next add
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      role: 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
