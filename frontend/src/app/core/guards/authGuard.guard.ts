import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notif = inject(NotificationService);

  if (authService.isUserLoggedIn()) {
    return true;
  }else{
    notif.error('You need to be logged in to access this page.', 'Access Denied');
    return router.navigate(['/auth/login']);
  }
};
