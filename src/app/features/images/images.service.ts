import { Injectable, signal, computed, inject } from '@angular/core';
import { ProductImage, ImageUploadResult, UploadItem } from './images.model';
import { ImagesFirebase } from './images.firebase';
import { ImagesApi } from './images.api';
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
  private _selectedImage = signal<ProductImage | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _searchTerm = signal<string>('');
  private _filterByFolderId = signal<string | null>(null);
  private _uploadQueue = signal<UploadItem[]>([]);
  private _uploading = signal<boolean>(false);

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  images = this._images.asReadonly();
  selectedImage = this._selectedImage.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  searchTerm = this._searchTerm.asReadonly();
  filterByFolderId = this._filterByFolderId.asReadonly();
  uploadQueue = this._uploadQueue.asReadonly();
  uploading = this._uploading.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of images
  imageCount = computed(() => this._images().length);

  // Images filtered by search term and folder
  filteredImages = computed(() => {
    let images = this._images();
    const search = this._searchTerm().toLowerCase();
    const folderId = this._filterByFolderId();

    // Filter by folder
    if (folderId !== null) {
      images = images.filter(img => img.folderId === folderId);
    }

    // Filter by search term
    if (search) {
      images = images.filter(
        (img) =>
          img.filename.toLowerCase().includes(search) ||
          img.alt?.toLowerCase().includes(search)
      );
    }

    return images;
  });

  // Unorganized images (without folder)
  unorganizedImages = computed(() =>
    this._images().filter(img => !img.folderId)
  );

  // Images by folder ID
  imagesByFolder = computed(() => {
    return (folderId: string) => this._images().filter(img => img.folderId === folderId);
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

  // Load all images
  async loadImages(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const images = await this.imagesFirebase.getProductImages();
      this._images.set(images);
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

      // Update selected image if it's the one being updated
      if (this._selectedImage()?.id === id) {
        this._selectedImage.update(img => img ? { ...img, ...data } : null);
      }
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

      // Clear selected image if it's the one being deleted
      if (this._selectedImage()?.id === id) {
        this._selectedImage.set(null);
      }
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
  async processUploadQueue(files: FileList | File[], folderId?: string, alt?: string): Promise<void> {
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
            folderId: folderId,
            alt: alt,
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

  // ========================================
  // UI STATE ACTIONS
  // ========================================

  // Select image
  selectImage(image: ProductImage | null): void {
    this._selectedImage.set(image);
  }

  // Set search term
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  // Clear search
  clearSearch(): void {
    this._searchTerm.set('');
  }

  // Set folder filter
  setFolderFilter(folderId: string | null): void {
    this._filterByFolderId.set(folderId);
  }

  // Clear all filters
  clearFilters(): void {
    this._searchTerm.set('');
    this._filterByFolderId.set(null);
  }

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

  // ========================================
  // SPECIALIZED QUERIES
  // ========================================

  // Load images by folder
  async loadImagesByFolder(folderId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const images = await this.imagesFirebase.getProductImagesByFolder(folderId);
      this._images.set(images);
    } catch (error) {
      this._error.set('Failed to load images by folder');
      console.error('Error loading images by folder:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Load unorganized images
  async loadUnorganizedImages(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const images = await this.imagesFirebase.getUnorganizedProductImages();
      this._images.set(images);
    } catch (error) {
      this._error.set('Failed to load unorganized images');
      console.error('Error loading unorganized images:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Search images
  async searchImages(searchTerm: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const images = await this.imagesFirebase.searchProductImages(searchTerm);
      this._images.set(images);
    } catch (error) {
      this._error.set('Failed to search images');
      console.error('Error searching images:', error);
    } finally {
      this._loading.set(false);
    }
  }
}
