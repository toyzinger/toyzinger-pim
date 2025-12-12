import { Injectable, signal, computed, inject } from '@angular/core';
import { deleteField } from '@angular/fire/firestore';
import { ProductImage, ImageUploadResult, UploadItem } from './pimages.model';
import { ImagesFirebase } from './pimages.firebase';
import { ImagesApi } from './pimages.api';
import { HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  private imagesFirebase = inject(ImagesFirebase);
  private imagesService = inject(ImagesApi);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _images = signal<ProductImage[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _uploadQueue = signal<UploadItem[]>([]);
  private _uploading = signal<boolean>(false);
  private _imagesLoaded = signal<boolean>(false); // Track if images have been loaded

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  images = this._images.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  uploadQueue = this._uploadQueue.asReadonly();
  uploading = this._uploading.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of images
  imageCount = computed(() => this._images().length);

  // Unorganized images (without subcollection)
  unorganizedImages = computed(() =>
    this._images().filter(img => !img.subcollectionId)
  );

  // Images by subcollection ID
  imagesBySubcollection = computed(() => {
    return (subcollectionId: string) => this._images().filter(img => img.subcollectionId === subcollectionId);
  });

  // Get image by ID
  getImageById = computed(() => {
    return (id: string) => this._images().find(img => img.id === id);
  });

  // Upload progress
  uploadProgress = computed(() => {
    const queue = this._uploadQueue();
    if (queue.length === 0) return 0;
    const totalProgress = queue.reduce((sum, item) => sum + (item.progress || 0), 0);
    return totalProgress / queue.length;
  });

  // Pending uploads
  pendingUploads = computed(() =>
    this._uploadQueue().filter(item => item.status === 'pending' || item.status === 'uploading')
  );

  // Successful uploads
  successfulUploads = computed(() =>
    this._uploadQueue().filter(item => item.status === 'success')
  );

  // Failed uploads
  failedUploads = computed(() =>
    this._uploadQueue().filter(item => item.status === 'error')
  );

  // ========================================
  // ACTIONS - CRUD OPERATIONS (Firestore)
  // ========================================

  // Ensure images are loaded (only loads once per session)
  async ensureImagesLoaded(): Promise<void> {
    if (!this._imagesLoaded()) {
      await this.loadImages();
    }
  }

  // Load all images (always fetches from Firebase)
  async loadImages(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const images = await this.imagesFirebase.getProductImages();
      this._images.set(images);
      this._imagesLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load images');
      console.error('Error loading images:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Create image record in Firestore
  async createImage(image: Omit<ProductImage, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const id = await this.imagesFirebase.addProductImage(image);
      // Optimistic update
      const newImage: ProductImage = { ...image, id };
      this._images.update(images => [...images, newImage]);
    } catch (error) {
      this._error.set('Failed to create image');
      console.error('Error creating image:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Update image record
  async updateImage(id: string, data: Partial<ProductImage>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      const currentImages = this._images();
      const updatedImages = currentImages.map(img =>
        img.id === id ? { ...img, ...data } : img
      );
      this._images.set(updatedImages);

      // Update in Firebase
      await this.imagesFirebase.updateProductImage(id, data);
    } catch (error) {
      this._error.set('Failed to update image');
      console.error('Error updating image:', error);
      // Reload images to revert optimistic update
      await this.loadImages();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Delete image record
  async deleteImage(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      this._images.update(images => images.filter(img => img.id !== id));

      // Delete from Firebase
      await this.imagesFirebase.deleteProductImage(id);
    } catch (error) {
      this._error.set('Failed to delete image');
      console.error('Error deleting image:', error);
      // Reload images to revert optimistic update
      await this.loadImages();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Update multiple images with the same data
   * @param ids - Array of image IDs to update
   * @param data - Partial image data to apply to all images
   */
  async updateMultipleImages(ids: string[], data: Partial<ProductImage>): Promise<void> {
    if (ids.length === 0) return;

    this._loading.set(true);
    this._error.set(null);

    try {
      // Prepare update data - handle undefined values with deleteField()
      const updateData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
          // Use deleteField() to remove the field from Firebase
          updateData[key] = deleteField();
        } else {
          updateData[key] = value;
        }
      }

      // 1. Optimistic update - update local cache immediately
      this._images.update(images =>
        images.map(img =>
          ids.includes(img.id!) ? { ...img, ...data } : img
        )
      );

      // 2. Sync to Firebase in background (without blocking UI)
      await Promise.all(
        ids.map(id => this.imagesFirebase.updateProductImage(id, updateData))
      );

    } catch (error) {
      this._error.set('Failed to update images');
      console.error('Error updating multiple images:', error);
      // On failure: reload all images from Firebase to restore correct state
      await this.loadImages();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ========================================
  // FILE UPLOAD ACTIONS (API)
  // ========================================

  // Upload multiple images to API only (no Firestore)
  async uploadImages(files: FileList | File[]): Promise<void> {
    this._uploading.set(true);
    this._error.set(null);

    // Add files to upload queue
    const filesArray = Array.from(files);
    const newItems: UploadItem[] = filesArray.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0
    }));

    this._uploadQueue.update(queue => [...queue, ...newItems]);

    try {
      // Upload all files
      for (const item of newItems) {
        await this.uploadSingleFile(item);
      }
    } catch (error) {
      this._error.set('Failed to upload images');
      console.error('Error uploading images:', error);
    } finally {
      this._uploading.set(false);
    }
  }

  // Upload a single file with progress tracking (private helper)
  private async uploadSingleFile(item: UploadItem): Promise<void> {
    // Update status to uploading
    this._uploadQueue.update(queue =>
      queue.map(q => q.id === item.id ? { ...q, status: 'uploading' as const, progress: 0 } : q)
    );

    return new Promise((resolve, reject) => {
      this.imagesService.uploadImage(item.file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this._uploadQueue.update(queue =>
              queue.map(q => q.id === item.id ? { ...q, progress } : q)
            );
          } else if (event.type === HttpEventType.Response) {
            const result = event.body as ImageUploadResult;
            if (result.files && result.files.length > 0) {
              this._uploadQueue.update(queue =>
                queue.map(q => q.id === item.id ? {
                  ...q,
                  status: 'success' as const,
                  progress: 100,
                  result: result.files[0]
                } : q)
              );
              resolve();
            } else {
              this._uploadQueue.update(queue =>
                queue.map(q => q.id === item.id ? {
                  ...q,
                  status: 'error' as const,
                  error: 'No files in response'
                } : q)
              );
              reject(new Error('No files in response'));
            }
          }
        },
        error: (error) => {
          this._uploadQueue.update(queue =>
            queue.map(q => q.id === item.id ? {
              ...q,
              status: 'error' as const,
              error: error.message || 'Upload failed'
            } : q)
          );
          reject(error);
        }
      });
    });
  }

  // Rollback: Delete file from server if Firestore save fails
  private async rollbackUpload(filename: string): Promise<void> {
    try {
      await this.imagesService.deleteImage(filename).toPromise();
      console.log(`Rolled back file: ${filename}`);
    } catch (error) {
      console.error(`Failed to rollback file ${filename}:`, error);
    }
  }

  // Upload files and save to Firestore with rollback on failure
  async processUploadQueue(files: FileList | File[], subcollectionId?: string, alt?: string): Promise<void> {
    this._uploading.set(true);
    this._error.set(null);

    // Add files to upload queue
    const filesArray = Array.from(files);
    const newItems: UploadItem[] = filesArray.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0
    }));

    this._uploadQueue.update(queue => [...queue, ...newItems]);

    try {
      // Process each file: upload to API then save to Firestore
      for (const item of newItems) {
        // Step 1: Upload to API
        try {
          await this.uploadSingleFile(item);
        } catch (error) {
          // Upload failed, continue to next file
          continue;
        }

        // Step 2: Save to Firestore
        const uploadedItem = this._uploadQueue().find(q => q.id === item.id);
        if (uploadedItem?.result && uploadedItem.status === 'success') {
          const imageData: Omit<ProductImage, 'id'> = {
            filename: uploadedItem.result.filename,
            ...(subcollectionId && { subcollectionId }), // Only include subcollectionId if it has a value
            ...(alt && { alt }), // Only include alt if it has a value
          };

          try {
            await this.createImage(imageData);
            // Success! Update item to indicate it's saved in DB
            this._uploadQueue.update(queue =>
              queue.map(q => q.id === item.id ? {
                ...q,
                error: undefined
              } : q)
            );
          } catch (error) {
            // Firestore save failed - rollback the uploaded file
            console.error(`Failed to save ${uploadedItem.result.filename} to Firestore:`, error);
            await this.rollbackUpload(uploadedItem.result.filename);

            // Update queue to show the complete error
            this._uploadQueue.update(queue =>
              queue.map(q => q.id === item.id ? {
                ...q,
                status: 'error' as const,
                error: 'Upload successful but failed to save to database. File has been removed from server.'
              } : q)
            );
          }
        }
      }
    } catch (error) {
      this._error.set('Failed to process upload queue');
      console.error('Error processing upload queue:', error);
    } finally {
      this._uploading.set(false);
    }
  }

  // Clear upload queue
  clearUploadQueue(): void {
    this._uploadQueue.set([]);
  }

  // Remove item from upload queue
  removeFromQueue(itemId: string): void {
    this._uploadQueue.update(queue => queue.filter(item => item.id !== itemId));
  }

  // Retry failed upload
  async retryUpload(itemId: string): Promise<void> {
    const item = this._uploadQueue().find(q => q.id === itemId);
    if (item && item.status === 'error') {
      await this.uploadSingleFile(item);
    }
  }

  // Add items to upload queue
  addToQueue(items: UploadItem[]): void {
    this._uploadQueue.update(queue => [...queue, ...items]);
  }

  /**
   * Clear subcollectionId from all images that belong to a specific subcollection
   * @param subcollectionId - The subcollection ID to clear from images
   */
  async clearImagesBySubcollection(subcollectionId: string): Promise<void> {
    if (!subcollectionId) return;

    this._loading.set(true);
    this._error.set(null);

    try {
      // Find all images with this subcollectionId
      const imagesToUpdate = this._images().filter(img => img.subcollectionId === subcollectionId);

      if (imagesToUpdate.length === 0) {
        this._loading.set(false);
        return;
      }

      const ids = imagesToUpdate.map(img => img.id!);

      // Data to clear subcollectionId reference
      const data: Partial<ProductImage> = {
        subcollectionId: undefined,
      };

      // Prepare Firebase update - use deleteField for undefined
      const updateData: any = {
        subcollectionId: deleteField()
      };

      // 1. Optimistic update - update local cache immediately
      this._images.update(images =>
        images.map(img =>
          ids.includes(img.id!)
            ? { ...img, ...data }
            : img
        )
      );

      // 2. Sync to Firebase in background
      await Promise.all(
        ids.map(id => this.imagesFirebase.updateProductImage(id, updateData))
      );

    } catch (error) {
      this._error.set('Failed to clear images by subcollection');
      console.error('Error clearing images by subcollection:', error);
      // On failure: reload all images from Firebase to restore correct state
      await this.loadImages();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ========================================
  // UI STATE ACTIONS
  // ========================================

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

}
