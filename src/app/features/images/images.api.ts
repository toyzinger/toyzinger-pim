import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageUploadResult } from './images.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesApi {
  private http = inject(HttpClient);
  private uploadUrl = '/api/upload';
  private deleteUrl = '/api/delete';

  /**
   * Upload multiple images to the server
   * @param files - FileList or File array containing the images to upload
   * @returns Observable with the upload result containing file information
   */
  uploadImages(files: FileList | File[]): Observable<ImageUploadResult> {
    const formData = new FormData();

    // Convert FileList to array and append each file
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<ImageUploadResult>(this.uploadUrl, formData);
  }

  /**
   * Upload a single image with progress tracking
   * @param file - The image file to upload
   * @returns Observable with HTTP events including upload progress
   */
  uploadImage(file: File): Observable<HttpEvent<ImageUploadResult>> {
    const formData = new FormData();
    formData.append('images', file);
    return this.http.post<ImageUploadResult>(this.uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  /**
   * Delete an image from the server by filename
   * @param filename - The name of the file to delete
   * @returns Observable with the deletion confirmation message
   */
  deleteImage(filename: string): Observable<{ message: string; filename: string }> {
    return this.http.delete<{ message: string; filename: string }>(`${this.deleteUrl}/${filename}`);
  }
}
