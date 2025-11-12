import { Injectable, signal, computed, inject } from '@angular/core';
import { Inscription, CreateInscription, UpdateInscription, InscriptionStatus } from '../models/inscription.interface';
import { CoursesService } from './courses.service';
import { StudentsService } from './students.service';

@Injectable({
  providedIn: 'root'
})
export class InscriptionsService {
  private coursesService = inject(CoursesService);
  private studentsService = inject(StudentsService);

  private inscriptionsSignal = signal<Inscription[]>(this.getInitialData());

  public readonly inscriptions = this.inscriptionsSignal.asReadonly();

  public readonly totalInscriptions = computed(() => this.inscriptionsSignal().length);

  public readonly activeInscriptions = computed(() =>
    this.inscriptionsSignal().filter(i => i.status === 'active').length
  );

  public readonly completedInscriptions = computed(() =>
    this.inscriptionsSignal().filter(i => i.status === 'completed').length
  );

  public readonly cancelledInscriptions = computed(() =>
    this.inscriptionsSignal().filter(i => i.status === 'cancelled').length
  );

  private nextId = 6;

  addInscription(inscription: CreateInscription): Inscription | null {
    console.log('[InscriptionsService] addInscription called with:', inscription);

    // Validate student exists
    const student = this.studentsService.getStudentById(inscription.studentId);
    if (!student) {
      console.log('[InscriptionsService] Student not found:', inscription.studentId);
      return null;
    }

    // Validate course exists and has capacity
    const course = this.coursesService.getCourseById(inscription.courseId);
    if (!course) {
      console.log('[InscriptionsService] Course not found:', inscription.courseId);
      return null;
    }

    if (!this.coursesService.canEnroll(inscription.courseId)) {
      console.log('[InscriptionsService] Course at capacity:', course.enrolled, '/', course.capacity);
      return null;
    }

    // Check if student is already enrolled in this course
    const existingInscription = this.inscriptionsSignal().find(
      i => i.studentId === inscription.studentId &&
           i.courseId === inscription.courseId &&
           (i.status === 'active' || i.status === 'completed')
    );

    if (existingInscription) {
      console.log('[InscriptionsService] Duplicate enrollment detected:', existingInscription);
      return null;
    }

    const newInscription: Inscription = {
      ...inscription,
      id: this.nextId++
    };
    console.log('[InscriptionsService] New inscription object:', newInscription);

    this.inscriptionsSignal.update(inscriptions => {
      const updated = [...inscriptions, newInscription];
      console.log('[InscriptionsService] Signal updated. Total inscriptions:', updated.length);
      return updated;
    });

    // Increment course enrollment
    this.coursesService.incrementEnrollment(inscription.courseId);
    console.log('[InscriptionsService] Course enrollment incremented');

    return newInscription;
  }

  updateInscription(id: number, changes: UpdateInscription): boolean {
    console.log('[InscriptionsService] updateInscription called with ID:', id, 'Changes:', changes);
    const inscriptions = this.inscriptionsSignal();
    const index = inscriptions.findIndex(i => i.id === id);

    if (index === -1) {
      console.log('[InscriptionsService] Inscription not found with ID:', id);
      return false;
    }

    const currentInscription = inscriptions[index];
    console.log('[InscriptionsService] Current inscription:', currentInscription);

    // If status is changing from active to cancelled/completed, decrement enrollment
    if (changes.status &&
        currentInscription.status === 'active' &&
        (changes.status === 'cancelled' || changes.status === 'completed')) {
      console.log('[InscriptionsService] Status changing from active, decrementing enrollment');
      this.coursesService.decrementEnrollment(currentInscription.courseId);
    }

    // If status is changing from cancelled to active, increment enrollment
    if (changes.status &&
        currentInscription.status === 'cancelled' &&
        changes.status === 'active') {
      console.log('[InscriptionsService] Status changing to active, checking capacity');
      if (!this.coursesService.canEnroll(currentInscription.courseId)) {
        console.log('[InscriptionsService] Cannot reactivate - course at capacity');
        return false;
      }
      this.coursesService.incrementEnrollment(currentInscription.courseId);
    }

    this.inscriptionsSignal.update(inscriptions =>
      inscriptions.map(inscription =>
        inscription.id === id
          ? { ...inscription, ...changes }
          : inscription
      )
    );
    console.log('[InscriptionsService] Inscription updated successfully');

    return true;
  }

  deleteInscription(id: number): boolean {
    const inscriptions = this.inscriptionsSignal();
    const inscription = inscriptions.find(i => i.id === id);

    if (!inscription) {
      return false;
    }

    // If inscription was active, decrement course enrollment
    if (inscription.status === 'active') {
      this.coursesService.decrementEnrollment(inscription.courseId);
    }

    this.inscriptionsSignal.update(inscriptions =>
      inscriptions.filter(i => i.id !== id)
    );

    return true;
  }

  getInscriptionById(id: number): Inscription | undefined {
    return this.inscriptionsSignal().find(i => i.id === id);
  }

  getInscriptionsByStudentId(studentId: number): Inscription[] {
    return this.inscriptionsSignal().filter(i => i.studentId === studentId);
  }

  getInscriptionsByCourseId(courseId: number): Inscription[] {
    return this.inscriptionsSignal().filter(i => i.courseId === courseId);
  }

  getInscriptionsByStatus(status: InscriptionStatus): Inscription[] {
    return this.inscriptionsSignal().filter(i => i.status === status);
  }

  cancelInscription(id: number): boolean {
    return this.updateInscription(id, { status: 'cancelled' });
  }

  completeInscription(id: number): boolean {
    return this.updateInscription(id, { status: 'completed' });
  }

  reactivateInscription(id: number): boolean {
    return this.updateInscription(id, { status: 'active' });
  }

  private getInitialData(): Inscription[] {
    return [
      {
        id: 1,
        studentId: 1, // Juan Pérez
        courseId: 1,  // Desarrollo Web con Angular
        enrollmentDate: new Date('2025-01-10'),
        status: 'active'
      },
      {
        id: 2,
        studentId: 2, // María González
        courseId: 2,  // Bases de Datos Avanzadas
        enrollmentDate: new Date('2025-01-25'),
        status: 'active'
      },
      {
        id: 3,
        studentId: 3, // Carlos López
        courseId: 3,  // Algoritmos y Estructuras de Datos
        enrollmentDate: new Date('2025-01-15'),
        status: 'active'
      },
      {
        id: 4,
        studentId: 1, // Juan Pérez
        courseId: 4,  // Programación en TypeScript
        enrollmentDate: new Date('2025-02-20'),
        status: 'active'
      },
      {
        id: 5,
        studentId: 4, // Ana Martínez
        courseId: 5,  // Arquitectura de Software
        enrollmentDate: new Date('2025-02-10'),
        status: 'active'
      }
    ];
  }
}
