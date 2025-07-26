import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file (File or Blob) to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param path The storage path (e.g., 'users/{userId}/profile.jpg')
 * @returns The download URL as a string
 */
export async function uploadFileToStorage(file: File | Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
} 