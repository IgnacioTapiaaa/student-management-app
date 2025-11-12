import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/students',
    pathMatch: 'full'
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./features/students/students.component').then(m => m.StudentsComponent),
    title: 'Students - Student Management System'
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then(m => m.CoursesComponent),
    title: 'Courses - Student Management System'
  },
  {
    path: 'inscriptions',
    loadComponent: () =>
      import('./features/inscriptions/inscriptions.component').then(m => m.InscriptionsComponent),
    title: 'Inscriptions - Student Management System'
  },
  {
    path: '**',
    redirectTo: '/students'
  }
];
