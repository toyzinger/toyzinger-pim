import { Component, inject, effect, signal, computed, OnInit } from '@angular/core';
import { DimensionFoldersService } from '../../features/dimensions/dimension-folders.service';
import { SPECIAL_DIM_FOLDERS } from '../../features/dimensions/dimensions.model';
import { ImagesService } from '../../features/pimages/pimages.service';
import { GlobalService } from '../../features/global/global.service';
import { ToastService } from '../../features/toast/toast.service';
import { PimageListItem } from './pimage-list-item/pimage-list-item';
import { FormCheckbox } from '../form/form-checkbox/form-checkbox';

@Component({
  selector: 'app-management-pimages',
  imports: [PimageListItem, FormCheckbox],
  templateUrl: './management-pimages.html',
  styleUrl: './management-pimages.scss',
})
export class ManagementPimages implements OnInit {
  private globalService = inject(GlobalService);
  private dimensionFoldersService = inject(DimensionFoldersService);
  private imagesService = inject(ImagesService);


  // Expose services to template
  loading = this.globalService.loading;
  error = this.imagesService.error;
  selectedNodeId = this.dimensionFoldersService.selectedNodeId;
  breadcrumb = this.dimensionFoldersService.breadcrumb;

  // Filtered images based on selected dimension node
  images = computed(() => {
    const allImages = this.imagesService.images();
    const selectedId = this.dimensionFoldersService.selectedNodeId();

    // No selection - show nothing
    if (!selectedId) {
      return [];
    }

    // Unassigned folder - show images without subcollectionId
    if (selectedId === SPECIAL_DIM_FOLDERS.UNASSIGNED) {
      return allImages.filter(img => !img.subcollectionId);
    }

    // SubCollection selected (isDroppable) - show images with matching subcollectionId
    if (this.dimensionFoldersService.isDroppable(selectedId)) {
      return allImages.filter(img => img.subcollectionId === selectedId);
    }

    // Franchise or collection selected - show nothing
    return [];
  });

  // Selection state
  selectedImages = signal<Set<string>>(new Set());
  selectAll = signal(false);

  constructor() {
    effect(() => this.clearSelectionOnNodeChange());
    effect(() => this.syncSelectAllWithSelection());
  }

  private clearSelectionOnNodeChange() {
    const nodeId = this.dimensionFoldersService.selectedNodeId();
    if (nodeId) {
      this.clearSelection();
    }
  }

  private syncSelectAllWithSelection() {
    const total = this.images().length;
    const selected = this.selectedImages().size;
    this.selectAll.set(total > 0 && selected === total);
  }

  ngOnInit() {
    // Load images only if not already loaded
    this.imagesService.ensureImagesLoaded();
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
    // Check if dragging a specific row
    const row = (event.target as HTMLElement).closest('tr');
    const imageId = row?.getAttribute('data-image-id');

    // If dragging a row and it's not selected, select it
    if (imageId && !this.isImageSelected(imageId)) {
      this.toggleImageSelection(imageId);
    }

    const selectedIds = Array.from(this.selectedImages());

    // If nothing selected, prevent drag
    if (selectedIds.length === 0) {
      event.preventDefault();
      return;
    }

    // Set drag data with all selected image IDs
    this.dimensionFoldersService.setDragData({
      type: 'images',
      ids: selectedIds,
    });

    // Create custom drag preview
    this.dimensionFoldersService.createDragPreview(event, selectedIds.length);
  }

  onDragEnd() {
    this.dimensionFoldersService.clearDragData();
    // Clear selection after drag ends (drop is handled by DimensionFoldersService)
    this.clearSelection();
  }
}
