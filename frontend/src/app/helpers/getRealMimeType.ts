import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Filevalidator {

  async validateRealMimeType(file: File): Promise<string> {
    return new Promise((resolve) => {
      const blob = file.slice(0, 16);
      const reader = new FileReader();

      reader.onloadend = (e) => {
        if (!e.target?.result) {
          resolve("unknown");
          return;
        }

        const arr = new Uint8Array(e.target.result as ArrayBuffer);
        let hex = '';

        for (let i = 0; i < arr.length; i++) {
          hex += arr[i].toString(16).padStart(2, '0');
        }

        resolve(this.detectMimeType(hex.toLowerCase()));
      };

      reader.onerror = () => resolve("unknown");
      reader.readAsArrayBuffer(blob);
    });
  }

private detectMimeType(hex: string): string {
  if (hex.startsWith('ffd8ff')) {
    return 'image/jpeg';
  }

  if (hex.startsWith('89504e47')) {
    return 'image/png';
  }

  if (hex.startsWith('47494638')) {
    return 'image/gif';
  }

  if (hex.startsWith('52494646') && hex.substring(16, 24) === '57454250') {
    return 'image/webp';
  }

  if (hex.substring(8, 16) === '66747970') {
    const subBrand = hex.substring(16, 32);

    if (subBrand.startsWith('61766966') || subBrand.startsWith('61766973')) {
      return 'image/avif';
    }

    return 'video/mp4';
  }

  if (hex.startsWith('1a45dfa3')) {
    return 'video/webm';
  }

  if (hex.startsWith('4f676753')) {
    return 'video/ogg';
  }

  return "unknown";
}
}
