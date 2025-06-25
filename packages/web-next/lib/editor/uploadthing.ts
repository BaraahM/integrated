import {
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';
import type { OurFileRouter } from '../../app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/uploadthing/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload image');
  }
}
