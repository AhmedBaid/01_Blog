import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSignal = signal<Notification | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  notification = this.notificationSignal.asReadonly();

  show(message: string, type: NotificationType = 'info', title?: string) {
    this.notificationSignal.set({ message, type, title });

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => this.clear(), 3000);
  }

  success(message: string, title = 'Success') {
    this.show(message, 'success', title);
  }

  error(message: string, title = 'Error') {
    this.show(message, 'error', title);
  }

  info(message: string, title = 'Info') {
    this.show(message, 'info', title);
  }

  warning(message: string, title = 'Warning') {
    this.show(message, 'warning', title);
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.notificationSignal.set(null);
  }
}
