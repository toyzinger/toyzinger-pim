import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageUploadResult } from './images.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/upload';

  uploadImages(files: FileList | File[]): Observable<ImageUploadResult> {
    const formData = new FormData();

    // Convert FileList to array and append each file
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<ImageUploadResult>(this.apiUrl, formData);
  }

  uploadImage(file: File): Observable<HttpEvent<ImageUploadResult>> {
    const formData = new FormData();
    formData.append('images', file);
    return this.http.post<ImageUploadResult>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
