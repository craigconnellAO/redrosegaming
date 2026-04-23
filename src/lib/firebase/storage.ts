import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

export function uploadVideo(
  file: File,
  videoId: string,
  onProgress: (p: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop() ?? 'mp4';
    const storageRef = ref(storage, `videos/${videoId}.${ext}`);

    // Resumable upload — essential for large files from iPad
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'video/mp4',
    });

    task.on(
      'state_changed',
      snapshot => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress({ bytesTransferred: snapshot.bytesTransferred, totalBytes: snapshot.totalBytes, percent });
      },
      error => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}
