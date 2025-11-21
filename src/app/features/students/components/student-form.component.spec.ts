import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StudentFormComponent, StudentFormData } from './student-form.component';
import { Student } from '../../../core/models/student.interface';

describe('StudentFormComponent', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StudentFormComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all fields', () => {
    expect(component.studentForm).toBeDefined();
    expect(component.studentForm.controls['firstName']).toBeDefined();
    expect(component.studentForm.controls['lastName']).toBeDefined();
    expect(component.studentForm.controls['age']).toBeDefined();
    expect(component.studentForm.controls['email']).toBeDefined();
  });

  it('should mark firstName as invalid when empty', () => {
    const firstNameControl = component.studentForm.controls.firstName;
    firstNameControl.setValue('');
    expect(firstNameControl.invalid).toBeTruthy();
    expect(firstNameControl.hasError('required')).toBeTruthy();
  });

  it('should mark lastName as invalid when empty', () => {
    const lastNameControl = component.studentForm.controls.lastName;
    lastNameControl.setValue('');
    expect(lastNameControl.invalid).toBeTruthy();
    expect(lastNameControl.hasError('required')).toBeTruthy();
  });

  it('should mark email as invalid with wrong format', () => {
    const emailControl = component.studentForm.controls.email;
    emailControl.setValue('notanemail');
    expect(emailControl.invalid).toBeTruthy();
    expect(emailControl.hasError('email')).toBeTruthy();
  });

  it('should mark email as valid with correct format', () => {
    const emailControl = component.studentForm.controls.email;
    emailControl.setValue('test@example.com');
    expect(emailControl.valid).toBeTruthy();
  });

  it('should mark age as invalid when null', () => {
    const ageControl = component.studentForm.controls.age;
    ageControl.setValue(null);
    expect(ageControl.invalid).toBeTruthy();
    expect(ageControl.hasError('required')).toBeTruthy();
  });

  it('should mark age as invalid when below minimum', () => {
    const ageControl = component.studentForm.controls.age;
    ageControl.setValue(5);
    expect(ageControl.invalid).toBeTruthy();
    expect(ageControl.hasError('min')).toBeTruthy();
  });

  it('should mark age as invalid when above maximum', () => {
    const ageControl = component.studentForm.controls.age;
    ageControl.setValue(150);
    expect(ageControl.invalid).toBeTruthy();
    expect(ageControl.hasError('max')).toBeTruthy();
  });

  it('should mark firstName as invalid when too short', () => {
    const firstNameControl = component.studentForm.controls.firstName;
    firstNameControl.setValue('A');
    expect(firstNameControl.invalid).toBeTruthy();
    expect(firstNameControl.hasError('minlength')).toBeTruthy();
  });

  it('should emit studentSubmit when form is valid', () => {
    spyOn(component.studentSubmit, 'emit');

    component.studentForm.controls.firstName.setValue('John');
    component.studentForm.controls.lastName.setValue('Doe');
    component.studentForm.controls.age.setValue(20);
    component.studentForm.controls.email.setValue('john@test.com');

    expect(component.studentForm.valid).toBeTruthy();

    component.onSubmit();

    expect(component.studentSubmit.emit).toHaveBeenCalled();
    const emittedData: StudentFormData = (component.studentSubmit.emit as jasmine.Spy).calls.argsFor(0)[0];
    expect(emittedData.data.firstName).toBe('John');
    expect(emittedData.data.lastName).toBe('Doe');
    expect(emittedData.data.age).toBe(20);
    expect(emittedData.data.email).toBe('john@test.com');
    expect(emittedData.editingId).toBeNull();
  });

  it('should not emit studentSubmit when form is invalid', () => {
    spyOn(component.studentSubmit, 'emit');

    component.studentForm.controls.firstName.setValue('');
    component.studentForm.controls.lastName.setValue('');
    component.studentForm.controls.age.setValue(null);
    component.studentForm.controls.email.setValue('');

    component.onSubmit();

    expect(component.studentSubmit.emit).not.toHaveBeenCalled();
    expect(component.studentForm.touched).toBeTruthy();
  });

  it('should load student data in edit mode', () => {
    const studentToEdit: Student = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      age: 25,
      email: 'jane@test.com'
    };

    component.studentToEdit = studentToEdit;
    component.ngOnChanges({
      studentToEdit: {
        currentValue: studentToEdit,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.studentForm.controls.firstName.value).toBe('Jane');
    expect(component.studentForm.controls.lastName.value).toBe('Smith');
    expect(component.studentForm.controls.age.value).toBe(25);
    expect(component.studentForm.controls.email.value).toBe('jane@test.com');
  });

  it('should include editingId when submitting in edit mode', () => {
    spyOn(component.studentSubmit, 'emit');

    const studentToEdit: Student = {
      id: 5,
      firstName: 'Bob',
      lastName: 'Brown',
      age: 30,
      email: 'bob@test.com'
    };

    component.studentToEdit = studentToEdit;
    component.ngOnChanges({
      studentToEdit: {
        currentValue: studentToEdit,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    component.onSubmit();

    expect(component.studentSubmit.emit).toHaveBeenCalled();
    const emittedData: StudentFormData = (component.studentSubmit.emit as jasmine.Spy).calls.argsFor(0)[0];
    expect(emittedData.editingId).toBe(5);
  });

  it('should reset form after successful submit', () => {
    component.studentForm.controls.firstName.setValue('John');
    component.studentForm.controls.lastName.setValue('Doe');
    component.studentForm.controls.age.setValue(20);
    component.studentForm.controls.email.setValue('john@test.com');

    component.onSubmit();

    expect(component.studentForm.controls.firstName.value).toBe('');
    expect(component.studentForm.controls.lastName.value).toBe('');
    expect(component.studentForm.controls.age.value).toBeNull();
    expect(component.studentForm.controls.email.value).toBe('');
  });

  it('should emit formCancel when onCancel is called', () => {
    spyOn(component.formCancel, 'emit');

    component.studentForm.controls.firstName.setValue('Test');
    component.onCancel();

    expect(component.formCancel.emit).toHaveBeenCalled();
  });

  it('should reset form when onCancel is called', () => {
    component.studentForm.controls.firstName.setValue('Test');
    component.studentForm.controls.lastName.setValue('User');

    component.onCancel();

    expect(component.studentForm.controls.firstName.value).toBe('');
    expect(component.studentForm.controls.lastName.value).toBe('');
  });

  it('should return correct error message for required field', () => {
    const firstNameControl = component.studentForm.controls.firstName;
    firstNameControl.setValue('');
    firstNameControl.markAsTouched();

    const errorMessage = component.getErrorMessage('firstName');
    expect(errorMessage).toBe('This field is required');
  });

  it('should return correct error message for invalid email', () => {
    const emailControl = component.studentForm.controls.email;
    emailControl.setValue('invalid');
    emailControl.markAsTouched();

    const errorMessage = component.getErrorMessage('email');
    expect(errorMessage).toBe('Please enter a valid email address');
  });

  it('should return correct error message for minlength', () => {
    const firstNameControl = component.studentForm.controls.firstName;
    firstNameControl.setValue('A');
    firstNameControl.markAsTouched();

    const errorMessage = component.getErrorMessage('firstName');
    expect(errorMessage).toContain('Minimum length is 2 characters');
  });

  it('should return correct error message for min age', () => {
    const ageControl = component.studentForm.controls.age;
    ageControl.setValue(5);
    ageControl.markAsTouched();

    const errorMessage = component.getErrorMessage('age');
    expect(errorMessage).toBe('Minimum value is 10');
  });

  it('should return correct error message for max age', () => {
    const ageControl = component.studentForm.controls.age;
    ageControl.setValue(150);
    ageControl.markAsTouched();

    const errorMessage = component.getErrorMessage('age');
    expect(errorMessage).toBe('Maximum value is 100');
  });

  it('should have default input values', () => {
    expect(component.formTitle).toBe('Add New Student');
    expect(component.submitButtonText).toBe('Save Student');
    expect(component.studentToEdit).toBeNull();
  });

  it('should accept custom input values', () => {
    component.formTitle = 'Edit Student';
    component.submitButtonText = 'Update';
    expect(component.formTitle).toBe('Edit Student');
    expect(component.submitButtonText).toBe('Update');
  });
});
