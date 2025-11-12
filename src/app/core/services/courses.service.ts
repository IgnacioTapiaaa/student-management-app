import { Injectable, signal, computed } from '@angular/core';
import { Course, CreateCourse, UpdateCourse } from '../models/course.interface';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private coursesSignal = signal<Course[]>(this.getInitialData());

  public readonly courses = this.coursesSignal.asReadonly();

  public readonly totalCourses = computed(() => this.coursesSignal().length);

  public readonly activeCourses = computed(() =>
    this.coursesSignal().filter(course => {
      const now = new Date();
      return course.startDate <= now && course.endDate >= now;
    }).length
  );

  public readonly averageEnrollment = computed(() => {
    const courses = this.coursesSignal();
    if (courses.length === 0) {
      return 0;
    }
    const total = courses.reduce((sum, course) => sum + course.enrolled, 0);
    return Math.round(total / courses.length);
  });

  private nextId = 6;

  addCourse(course: CreateCourse): Course {
    console.log('[CoursesService] addCourse called with:', course);
    const newCourse: Course = {
      ...course,
      id: this.nextId++
    };
    console.log('[CoursesService] New course object:', newCourse);

    this.coursesSignal.update(courses => {
      const updated = [...courses, newCourse];
      console.log('[CoursesService] Signal updated. Total courses:', updated.length);
      return updated;
    });

    return newCourse;
  }

  updateCourse(id: number, changes: UpdateCourse): boolean {
    console.log('[CoursesService] updateCourse called with ID:', id, 'Changes:', changes);
    const courses = this.coursesSignal();
    const index = courses.findIndex(c => c.id === id);

    if (index === -1) {
      console.log('[CoursesService] Course not found with ID:', id);
      return false;
    }

    this.coursesSignal.update(courses =>
      courses.map(course =>
        course.id === id
          ? { ...course, ...changes }
          : course
      )
    );
    console.log('[CoursesService] Course updated successfully');

    return true;
  }

  deleteCourse(id: number): boolean {
    const courses = this.coursesSignal();
    const index = courses.findIndex(c => c.id === id);

    if (index === -1) {
      return false;
    }

    this.coursesSignal.update(courses =>
      courses.filter(course => course.id !== id)
    );

    return true;
  }

  getCourseById(id: number): Course | undefined {
    return this.coursesSignal().find(c => c.id === id);
  }

  searchCourses(term: string): Course[] {
    if (!term || term.trim() === '') {
      return this.coursesSignal();
    }

    const searchTerm = term.toLowerCase().trim();

    return this.coursesSignal().filter(course =>
      course.name.toLowerCase().includes(searchTerm) ||
      course.code.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm)
    );
  }

  getAvailableCourses(): Course[] {
    return this.coursesSignal().filter(course =>
      course.enrolled < course.capacity
    );
  }

  canEnroll(courseId: number): boolean {
    const course = this.getCourseById(courseId);
    return course ? course.enrolled < course.capacity : false;
  }

  incrementEnrollment(courseId: number): boolean {
    const course = this.getCourseById(courseId);

    if (!course || course.enrolled >= course.capacity) {
      return false;
    }

    return this.updateCourse(courseId, {
      enrolled: course.enrolled + 1
    });
  }

  decrementEnrollment(courseId: number): boolean {
    const course = this.getCourseById(courseId);

    if (!course || course.enrolled <= 0) {
      return false;
    }

    return this.updateCourse(courseId, {
      enrolled: course.enrolled - 1
    });
  }

  private getInitialData(): Course[] {
    return [
      {
        id: 1,
        name: 'Desarrollo Web con Angular',
        code: 'DWA-101',
        instructor: 'Dr. Carlos Mendoza',
        duration: 40,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-03-15'),
        capacity: 30,
        enrolled: 25
      },
      {
        id: 2,
        name: 'Bases de Datos Avanzadas',
        code: 'BDA-201',
        instructor: 'Dra. Ana Martínez',
        duration: 60,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-30'),
        capacity: 25,
        enrolled: 20
      },
      {
        id: 3,
        name: 'Algoritmos y Estructuras de Datos',
        code: 'AED-301',
        instructor: 'Prof. Miguel Rodríguez',
        duration: 50,
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-04-10'),
        capacity: 35,
        enrolled: 30
      },
      {
        id: 4,
        name: 'Programación en TypeScript',
        code: 'PTS-102',
        instructor: 'Ing. Laura García',
        duration: 30,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-15'),
        capacity: 20,
        enrolled: 15
      },
      {
        id: 5,
        name: 'Arquitectura de Software',
        code: 'ARS-401',
        instructor: 'Dr. José López',
        duration: 45,
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-05-15'),
        capacity: 28,
        enrolled: 22
      }
    ];
  }
}
