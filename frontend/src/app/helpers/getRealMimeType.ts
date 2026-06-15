export function getRealMimeType(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, 12);

    reader.onloadend = (e: any) => {
      if (e.target.readyState !== FileReader.DONE) return;

      const arr = new Uint8Array(e.target.result);
      let header = '';
      for (let i = 0; i < Math.min(arr.length, 6); i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }

      header = header.toUpperCase();
      const infoString = arr.reduce((acc, byte) => acc + String.fromCharCode(byte), '');

      if (header.startsWith('89504E47')) return resolve('image/png');
      if (header.startsWith('FFD8FF')) return resolve('image/jpeg');
      if (header.startsWith('47494638')) return resolve('image/gif');
      if (header.startsWith('52494646') && header.endsWith('57454250', 12))
        return resolve('image/webp');

      if (header.includes('1A45DFA3')) return resolve('video/webm');
      if (
        infoString.includes('ftypmp42') ||
        infoString.includes('ftypisom') ||
        infoString.includes('ftypmp41')
      ) {
        return resolve('video/mp4');
      }
      if (header.startsWith('4F676753')) return resolve('video/ogg');

      resolve(file.type || 'unknown');
    };

    reader.onerror = () => reject();
    reader.readAsArrayBuffer(blob);
  });
}
