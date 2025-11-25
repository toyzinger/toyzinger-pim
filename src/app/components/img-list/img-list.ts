import { Component, inject, effect, signal } from '@angular/core';
import { FoldersService } from '../../features/folders/folders.service';
import { SPECIAL_FOLDERS } from '../../features/folders/folders.model';
import { ImagesService } from '../../features/productimages/productimages.service';
import { GlobalService } from '../../features/global/global.service';
import { ToastService } from '../../features/toast/toast.service';
import { ImgListItem } from './img-list-item/img-list-item';
import { FormCheckbox } from '../form/form-checkbox/form-checkbox';

@Component({
  selector: 'app-img-list',
  imports: [ImgListItem, FormCheckbox],
  templateUrl: './img-list.html',
  styleUrl: './img-list.scss',
})
export class ImgList {
  private foldersService = inject(FoldersService);
  private imagesService = inject(ImagesService);
  private global = inject(GlobalService);
  private toastService = inject(ToastService);

  // Expose services to template
  images = this.imagesService.filteredImages;
  loading = this.imagesService.loading;
  error = this.imagesService.error;
  selectedFolder = this.foldersService.selectedFolder;

  // Selection state
  selectedImages = signal<Set<string>>(new Set());
  selectAll = signal(false);

  constructor() {
    // Watch for folder selection changes
    effect(() => {
      const folder = this.foldersService.selectedFolder();

      if (folder?.id === SPECIAL_FOLDERS.UNASSIGNED) {
        // Load unorganized images
        this.imagesService.loadUnorganizedImages();
      } else if (folder && !folder.isVirtual) {
        // Load images for the selected regular folder
        this.imagesService.loadImagesByFolder(folder.id!);
      }

      // Clear selection when folder changes
      this.clearSelection();
    });

    // Sync selectAll checkbox with actual selection
    effect(() => {
      const total = this.images().length;
      const selected = this.selectedImages().size;

      // Only set to true if we have items AND all are selected
      // Otherwise set to false
      this.selectAll.set(total > 0 && selected === total);
    });

    // Listen for folder drop events
    effect(() => {
      const dropEvent = this.global.folderDrop();
      const dragData = this.global.dragData();

      // Only handle if we're dragging images AND there's a drop event
      if (dropEvent && dragData?.type === 'images') {
        // Handle the drop
        this.handleFolderDrop(dropEvent.folderId, dragData.ids);

        // Clear the drop event to prevent re-triggering
        this.global.clearFolderDrop();
      }
    });
  }

  toggleSelectAll() {
    const allSelected = this.selectAll();

    if (allSelected) {
      // Deselect all
      this.selectedImages.set(new Set());
    } else {
      // Select all
      const allIds = this.images().map(img => img.id!);
      this.selectedImages.set(new Set(allIds));
    }
  }

  toggleImageSelection(imageId: string) {
    const current = new Set(this.selectedImages());

    if (current.has(imageId)) {
      current.delete(imageId);
    } else {
      current.add(imageId);
    }

    this.selectedImages.set(current);
  }

  isImageSelected(imageId: string): boolean {
    return this.selectedImages().has(imageId);
  }

  clearSelection() {
    this.selectedImages.set(new Set());
  }

  onDragStart(event: DragEvent) {
    // Get the dragged row's image ID from the event target
    const row = (event.target as HTMLElement).closest('tr');
    const imageId = row?.getAttribute('data-image-id');

    if (!imageId) return;

    // If dragging an unselected image, select it first
    if (!this.isImageSelected(imageId)) {
      this.toggleImageSelection(imageId);
    }

    // Set drag data with all selected image IDs
    const selectedIds = Array.from(this.selectedImages());
    this.global.setDragData({
      type: 'images',
      ids: selectedIds,
    });

    // Create custom drag preview
    this.global.createDragPreview(event, selectedIds.length, 'photo_library', 'image');
  }

  onDragEnd() {
    this.global.clearDragData();
  }

  /**
   * Handle folder drop event by updating images
   */
  async handleFolderDrop(folderId: string, imageIds: string[]) {
    try {
      // Special handling for UNASSIGNED folder - remove folderId assignment
      if (folderId === SPECIAL_FOLDERS.UNASSIGNED) {
        await this.imagesService.updateMultipleImages(imageIds, { folderId: undefined });
      } else {
        await this.imagesService.updateMultipleImages(imageIds, { folderId });
      }

      const count = imageIds.length;
      const folderName = folderId === SPECIAL_FOLDERS.UNASSIGNED ? 'unassigned' : 'folder';
      this.toastService.success(`Moved ${count} image${count > 1 ? 's' : ''} to ${folderName}`);

      // Clear selection after successful move
      this.clearSelection();
    } catch (error) {
      this.toastService.danger('Failed to move images');
      console.error('Error moving images:', error);
    }
  }
}
