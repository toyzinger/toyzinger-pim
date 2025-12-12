import { Component, inject, signal, computed } from '@angular/core';
import { ImagesService } from '../../features/pimages/pimages.service';
import { UploadItem } from '../../features/pimages/pimages.model';
import { FormInput } from '../../components/form/form-input/form-input';
import { DropdownFranchises } from "../dropdown-franchises/dropdown-franchises";
import { DropdownCollections } from "../dropdown-collections/dropdown-collections";
import { DropdownSubCollections } from "../dropdown-subcollections/dropdown-subcollections";
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';

@Component({
  selector: 'app-upload-images',
  imports: [
    FormInput,
    DropdownFranchises,
    DropdownCollections,
    DropdownSubCollections
  ],
  templateUrl: './upload-images.html',
  styleUrl: './upload-images.scss',
})
export class UploadImages {
  private imagesService = inject(ImagesService);
  private subcollectionService = inject(SubCollectionService);


  // ===== SIGNALS ======
  altText = signal<string>('');
  isDragOver = signal(false);
  subcollectionId = this.subcollectionService.selectedSubCollectionId;

  // Use store signals
  uploadQueue = this.imagesService.uploadQueue;
  isUploading = this.imagesService.uploading;

  // Computed signal to sort queue: Error items first, then by original order
  sortedQueue = computed(() => {
    const queue = this.uploadQueue();
    return [...queue].sort((a, b) => {
      if (a.status === 'error' && b.status !== 'error') return -1;
      if (a.status !== 'error' && b.status === 'error') return 1;
      return 0; // Keep original order otherwise
    });
  });

  clearFilters() {
    this.subcollectionService.clearSelectedSubCollectionId();
    this.altText.set('');
  }

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
      this.imagesService.addToQueue(invalidItems);
    }

    // Upload valid files and save to Firestore
    if (validFiles.length > 0) {
      const subcollectionId = this.subcollectionId() || undefined;
      const alt = this.altText() || undefined;
      this.imagesService.processUploadQueue(validFiles, subcollectionId, alt);
    }
  }

  retry(itemId: string) {
    this.imagesService.retryUpload(itemId);
  }

  resetQueue() {
    this.imagesService.clearUploadQueue();
  }
}
