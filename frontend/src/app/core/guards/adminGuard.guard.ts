import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notif = inject(NotificationService);

  return authService.isTheUserAdmin().pipe(
    map((isAdmin) => {
      if (isAdmin) {
        return true;
      } else {
        notif.error('You do not have permission to access this page.', 'Access Denied');
        router.navigate(['/home']);
        return false;
      }
    }),
  );
};
