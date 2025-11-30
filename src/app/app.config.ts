import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { uiReducer } from './store/ui/ui.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { studentsReducer } from './features/students/store/students.reducer';
import { StudentsEffects } from './features/students/store/students.effects';
import { coursesReducer } from './features/courses/store/courses.reducer';
import { CoursesEffects } from './features/courses/store/courses.effects';
import { inscriptionsReducer } from './features/inscriptions/store/inscriptions.reducer';
import { InscriptionsEffects } from './features/inscriptions/store/inscriptions.effects';
import { usersReducer } from './features/users/store/users.reducer';
import { UsersEffects } from './features/users/store/users.effects';
import { CustomSerializer } from './store/router/custom-serializer';
import { TitleService } from './core/services/title.service';
import { routerReducer } from '@ngrx/router-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideRouterStore({ serializer: CustomSerializer }),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // NGRX Store Configuration
    provideStore({
      auth: authReducer,
      ui: uiReducer,
      students: studentsReducer,
      courses: coursesReducer,
      inscriptions: inscriptionsReducer,
      users: usersReducer,
      router: routerReducer
    }),
    // NGRX Effects Configuration
    provideEffects([AuthEffects, StudentsEffects, CoursesEffects, InscriptionsEffects, UsersEffects]),
    // NGRX Store DevTools (only in development mode)
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode in production
      autoPause: true, // Pauses recording actions when the extension window is not open
      trace: false, // If set to true, will include stack trace for every action
      traceLimit: 75 // Maximum stack trace frames to be stored (in case trace option is true)
    }),
    // Initialize TitleService to handle automatic toolbar title updates
    {
      provide: APP_INITIALIZER,
      useFactory: (titleService: TitleService) => () => titleService.init(),
      deps: [TitleService],
      multi: true
    }
  ]
};
