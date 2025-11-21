import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/students',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Student Management System'
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./features/students/students.component').then(m => m.StudentsComponent),
    title: 'Students - Student Management System',
    canActivate: [authGuard]
  },
  {
    path: 'students/:id',
    loadComponent: () =>
      import('./features/students/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
    title: 'Student Details - Student Management System',
    canActivate: [authGuard]
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then(m => m.CoursesComponent),
    title: 'Courses - Student Management System',
    canActivate: [authGuard]
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
    title: 'Course Details - Student Management System',
    canActivate: [authGuard]
  },
  {
    path: 'inscriptions',
    loadComponent: () =>
      import('./features/inscriptions/inscriptions.component').then(m => m.InscriptionsComponent),
    title: 'Inscriptions - Student Management System',
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/users.component').then(m => m.UsersComponent),
    title: 'Users - Student Management System',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
