export interface UserData {
  emailOrUsername: string;
  password: string;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  message: string;
  title?: string;
  type: NotificationType;
}
