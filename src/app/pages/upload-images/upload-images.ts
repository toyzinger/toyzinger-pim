import { Component, inject, signal } from '@angular/core';
import { ImagesService } from '../../features/images/images.service';
import { ImageUploadResponse } from '../../features/images/images.model';

@Component({
  selector: 'app-upload-images',
  imports: [],
  templateUrl: './upload-images.html',
  styleUrl: './upload-images.scss',
})
export class UploadImages {
  private imagesService = inject(ImagesService);

  isDragOver = signal(false);
  isUploading = signal(false);
  uploadedImages = signal<ImageUploadResponse[]>([]);
  errorMessage = signal('');


  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  private handleFiles(files: FileList) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        console.warn(`File "${file.name}" is not a valid image type`);
      }
    }

    if (validFiles.length === 0) {
      this.errorMessage.set('No valid image files selected');
      return;
    }

    this.uploadImages(validFiles);
  }

  private uploadImages(files: File[]) {
    this.isUploading.set(true);
    this.errorMessage.set('');

    // Create a new FileList-like array
    const fileList = files as any;

    this.imagesService.uploadImages(fileList).subscribe({
      next: (result) => {
        console.log('Upload successful:', result);
        this.uploadedImages.update(images => [...images, ...result.files]);
        this.isUploading.set(false);
      },
      error: (error) => {
        console.error('Upload error:', error);
        const errorMsg = error.error?.error || 'Failed to upload images';
        this.errorMessage.set(errorMsg);
        this.isUploading.set(false);
      }
    });
  }
}
