import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isTheUserAdmin().pipe(
    map((isAdmin) => {
      if (isAdmin) {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    }),
  );
};
