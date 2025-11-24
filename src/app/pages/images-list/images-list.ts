import { Component, inject, effect } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { FormComponents } from '../../components/form/form';
import { FoldersService } from '../../features/folders/folders.service';
import { ImagesService } from '../../features/productimages/productimages.service';
import { ImagesListItem } from '../../components/images-list-item/images-list-item';

@Component({
  selector: 'app-images-list',
  imports: [Sidebar, FormComponents, ImagesListItem],
  templateUrl: './images-list.html',
  styleUrl: './images-list.scss',
})
export class ImagesList {
  private foldersService = inject(FoldersService);
  private imagesService = inject(ImagesService);

  // Expose services to template
  images = this.imagesService.images;
  loading = this.imagesService.loading;
  error = this.imagesService.error;
  selectedFolder = this.foldersService.selectedFolder;

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
    });
  }
}
