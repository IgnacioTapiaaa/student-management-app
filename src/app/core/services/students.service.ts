import { Injectable, signal, computed } from '@angular/core';
import { Student, CreateStudent, UpdateStudent } from '../models/student.interface';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private studentsSignal = signal<Student[]>(this.getInitialData());

  public readonly students = this.studentsSignal.asReadonly();

  public readonly totalStudents = computed(() => this.studentsSignal().length);

  public readonly averageAge = computed(() => {
    const students = this.studentsSignal();
    if (students.length === 0) {
      return 0;
    }
    const total = students.reduce((sum, student) => sum + student.age, 0);
    return Math.round(total / students.length);
  });

  private nextId = 6;

  addStudent(student: CreateStudent): Student {
    console.log('[StudentsService] addStudent called with:', student);
    const newStudent: Student = {
      ...student,
      id: this.nextId++
    };
    console.log('[StudentsService] New student object:', newStudent);

    this.studentsSignal.update(students => {
      const updated = [...students, newStudent];
      console.log('[StudentsService] Signal updated. Total students:', updated.length);
      return updated;
    });

    return newStudent;
  }

  updateStudent(id: number, changes: UpdateStudent): boolean {
    console.log('[StudentsService] updateStudent called with ID:', id, 'Changes:', changes);
    const students = this.studentsSignal();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      console.log('[StudentsService] Student not found with ID:', id);
      return false;
    }

    this.studentsSignal.update(students =>
      students.map(student =>
        student.id === id
          ? { ...student, ...changes }
          : student
      )
    );
    console.log('[StudentsService] Student updated successfully');

    return true;
  }

  deleteStudent(id: number): boolean {
    const students = this.studentsSignal();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return false;
    }

    this.studentsSignal.update(students =>
      students.filter(student => student.id !== id)
    );

    return true;
  }

  getStudentById(id: number): Student | undefined {
    return this.studentsSignal().find(s => s.id === id);
  }

  searchStudents(term: string): Student[] {
    if (!term || term.trim() === '') {
      return this.studentsSignal();
    }

    const searchTerm = term.toLowerCase().trim();

    return this.studentsSignal().filter(student =>
      student.firstName.toLowerCase().includes(searchTerm) ||
      student.lastName.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)
    );
  }

  private getInitialData(): Student[] {
    return [
      {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        age: 20,
        email: 'juan@mail.com'
      },
      {
        id: 2,
        firstName: 'María',
        lastName: 'González',
        age: 22,
        email: 'maria@mail.com'
      },
      {
        id: 3,
        firstName: 'Carlos',
        lastName: 'López',
        age: 19,
        email: 'carlos@mail.com'
      },
      {
        id: 4,
        firstName: 'Ana',
        lastName: 'Martínez',
        age: 21,
        email: 'ana@mail.com'
      },
      {
        id: 5,
        firstName: 'Pedro',
        lastName: 'Rodríguez',
        age: 23,
        email: 'pedro@mail.com'
      }
    ];
  }
}
