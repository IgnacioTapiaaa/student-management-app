import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Admin Guard - Protects routes that require admin role
 * Redirects to students page if user is not admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticatedUser()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Then check if user has admin role
  if (authService.hasAdminRole()) {
    return true;
  }

  // User is authenticated but not admin - redirect to students page
  router.navigate(['/students']);
  return false;
};
