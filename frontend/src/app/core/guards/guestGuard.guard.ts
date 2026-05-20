import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceTs } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthServiceTs);

  if (authService.isUserLoggedIn()) {
    return router.navigate(['/home']);
  }

  return true;
};
