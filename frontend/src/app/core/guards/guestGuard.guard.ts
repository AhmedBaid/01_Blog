import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notif = inject(NotificationService);
  if (authService.isUserLoggedIn()) {
    notif.error('You are already logged in.', 'Access Denied');
    return router.navigate(['/home']);
  }

  return true;
};
