import { Component, inject, signal, computed } from '@angular/core';
import { ImagesService } from '../../features/productimages/productimages.service';
import { UploadItem } from '../../features/productimages/productimages.model';
import { FoldersDropdown } from '../../components/folders-dropdown/folders-dropdown';
import { FormInput } from '../../components/form/form-input/form-input';

@Component({
  selector: 'app-upload-images',
  imports: [FoldersDropdown, FormInput],
  templateUrl: './upload-images.html',
  styleUrl: './upload-images.scss',
})
export class UploadImages {
  private imagesStore = inject(ImagesService);

  selectedFolderId = signal<string>('');
  altText = signal<string>('');
  isDragOver = signal(false);

  // Use store signals
  uploadQueue = this.imagesStore.uploadQueue;
  isUploading = this.imagesStore.uploading;

  // Computed signal to sort queue: Error items first, then by original order
  sortedQueue = computed(() => {
    const queue = this.uploadQueue();
    return [...queue].sort((a, b) => {
      if (a.status === 'error' && b.status !== 'error') return -1;
      if (a.status !== 'error' && b.status === 'error') return 1;
      return 0; // Keep original order otherwise
    });
  });

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
    // Reset input to allow selecting the same file again
    input.value = '';
  }

  private handleFiles(files: FileList) {
    // Define allowed image MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const filesArray = Array.from(files);
    const validFiles: File[] = [];
    const invalidItems: UploadItem[] = [];

    // Validate each file
    filesArray.forEach(file => {
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        // Create invalid item to show in queue with error
        invalidItems.push({
          id: crypto.randomUUID(),
          file,
          status: 'invalid',
          error: `Invalid file type: ${file.type || 'unknown'}. Allowed: JPEG, PNG, GIF, WebP, SVG`
        });
      }
    });

    // Add invalid items to the queue
    if (invalidItems.length > 0) {
      this.imagesStore.addToQueue(invalidItems);
    }

    // Upload valid files and save to Firestore
    if (validFiles.length > 0) {
      const folderId = this.selectedFolderId() || undefined;
      const alt = this.altText() || undefined;
      this.imagesStore.processUploadQueue(validFiles, folderId, alt);
    }
  }

  retry(itemId: string) {
    this.imagesStore.retryUpload(itemId);
  }

  resetQueue() {
    this.imagesStore.clearUploadQueue();
  }
}
