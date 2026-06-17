import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormatTime {
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) {
      return `${secondsAgo} second ago`;
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo} minute ago`;
    } else if (secondsAgo < 86400) {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      return `${hoursAgo} hour ago`;
    } else {
      const daysAgo = Math.floor(secondsAgo / 86400);
      return `${daysAgo} day ago`;
    }
  }
}
