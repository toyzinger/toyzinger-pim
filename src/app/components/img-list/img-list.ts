import { Component, inject, effect, signal, OnInit } from '@angular/core';
import { FoldersService } from '../../features/folders/folders.service';
import { ImagesService } from '../../features/productimages/productimages.service';
import { ImgListItem } from './img-list-item/img-list-item';
import { FormCheckbox } from '../form/form-checkbox/form-checkbox';

@Component({
  selector: 'app-img-list',
  imports: [ImgListItem, FormCheckbox],
  templateUrl: './img-list.html',
  styleUrl: './img-list.scss',
})
export class ImgList implements OnInit {
  private foldersService = inject(FoldersService);
  private imagesService = inject(ImagesService);

  // Expose services to template
  images = this.imagesService.images;
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

      if (folder && !folder.isVirtual) {
        // Load images for the selected folder
        this.imagesService.loadImagesByFolder(folder.id!);
      } else if (folder?.id === 'unassigned') {
        // Load unorganized images
        this.imagesService.loadUnorganizedImages();
      } else {
        // Load all images
        this.imagesService.loadImages();
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
  }

  ngOnInit(): void {
    console.log('selectedImages on init:', this.selectedImages());
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
}
