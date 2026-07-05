import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const notif = inject(NotificationService);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }

      if (error.status === 403 && router.url.startsWith('/admin')) {
        router.navigate(['/home']);
      }

      if (error.status === 403) {
        const errorMessage = error.error?.message || '';

        if (errorMessage.toLowerCase().includes('banned')) {
          notif.error('your account is banned', 'Banned');
          authService.logout();
          router.navigate(['/auth/login']);
        }
      }

      return throwError(() => error);
    }),
  );
};
