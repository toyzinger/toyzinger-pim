import { Component, inject, signal, computed } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ImagesService } from '../../features/images/images.service';
import { UploadItem } from '../../features/images/images.model';
import { FoldersDropdown } from '../../components/folders-dropdown/folders-dropdown';

@Component({
  selector: 'app-upload-images',
  imports: [FoldersDropdown],
  templateUrl: './upload-images.html',
  styleUrl: './upload-images.scss',
})
export class UploadImages {
  private imagesService = inject(ImagesService);

  selectedFolderId = signal<string>('');

  isDragOver = signal(false);
  uploadQueue = signal<UploadItem[]>([]);
  isUploading = signal(false);

  // Computed signal to sort queue: Error items first, then by original order
  sortedQueue = computed(() => {
    const queue = this.uploadQueue();
    return [...queue].sort((a, b) => {
      if (a.status === 'error' && b.status !== 'error') return -1;
      if (a.status !== 'error' && b.status === 'error') return 1;
      return 0; // Keep original order otherwise
    });
  });

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
    // Reset input to allow selecting the same file again
    input.value = '';
  }

  private handleFiles(files: FileList) {
    // Define allowed image MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const newItems: UploadItem[] = [];
    // Iterate through all selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validate if the file type is allowed
      if (allowedTypes.includes(file.type)) {
        // Create a new upload item with a unique ID and pending status
        newItems.push({
          id: crypto.randomUUID(),
          file,
          status: 'pending'
        });
      } else {
        // Add rejected file to the queue with invalid status and error message
        newItems.push({
          id: crypto.randomUUID(),
          file,
          status: 'invalid',
          error: `Invalid file type: ${file.type || 'unknown'}. Allowed types: JPEG, PNG, GIF, WebP, SVG`
        });
      }
    }
    // If no valid files were selected, show an error message and escape
    if (newItems.length === 0) {
      this.errorMessage.set('No valid image files selected');
      return;
    }
    // Clear any previous error messages
    this.errorMessage.set('');
    // Add the new items to the upload queue
    this.uploadQueue.update(queue => [...queue, ...newItems]);
    // Start processing the queue
    this.processQueue();
  }

  private processQueue() {
    const queue = this.uploadQueue();
    // Find the next pending item in the queue
    const item = queue.find(item => item.status === 'pending');
    // If no pending items, stop processing
    if (!item) {
      this.isUploading.set(false);
      return;
    }
    // Set uploading flag to true
    this.isUploading.set(true);
    // Update item status to uploading
    this.updateItemStatus(item.id, 'uploading');
    // Start the upload for the current item
    this.imagesService.uploadImage(item.file).subscribe({
      next: (event) => {
        // Handle upload progress events
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((100 * event.loaded) / event.total);
          this.updateItemStatus(item.id, 'uploading', { progress });
        }
        // Handle successful completion
        else if (event.type === HttpEventType.Response) {
          const result = event.body;
          if (result && result.files && result.files.length > 0) {
            const uploadedFile = result.files[0];
            // Mark item as success and set progress to 100%
            this.updateItemStatus(item.id, 'success', { result: uploadedFile, progress: 100 });
            // Process the next item in the queue
            this.processNext();
          }
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        const errorMsg = error.error?.error || 'Failed to upload';
        // Mark item as error if upload fails
        this.updateItemStatus(item.id, 'error', { error: errorMsg, progress: 0 });
        // Continue processing the next item despite the error
        this.processNext();
      }
    });
  }

  private processNext() {
    setTimeout(() => {
      this.processQueue();
    }, 300);
  }

  retry(itemId: string) {
    this.updateItemStatus(itemId, 'pending', { error: undefined });
    this.processQueue();
  }

  resetQueue() {
    this.uploadQueue.set([]);
  }

  private updateItemStatus(id: string, status: UploadItem['status'], updates: Partial<UploadItem> = {}) {
    this.uploadQueue.update(queue =>
      queue.map(item =>
        item.id === id ? { ...item, status, ...updates } : item
      )
    );
  }
}
