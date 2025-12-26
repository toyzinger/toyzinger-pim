import { Component, signal, HostListener, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ContextType } from '../../features/global/global.model';
import { DimensionFolders } from "../dimension-folders/dimension-folders";

@Component({
  selector: 'app-sidebar',
  imports: [DimensionFolders],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private router = inject(Router);

  width = signal(450); // Initial width in pixels
  private isResizing = false;
  private minWidth = 200;
  private maxWidth = 700;

  /**
   * Determine the folder mode based on current route
   * 'images' for image-related routes, 'products' for product-related routes
   */
  folderMode = computed<ContextType>(() => {
    const url = this.router.url;
    // Check if current route is image-related
    if (url.includes('/images') || url.includes('/new-images')) {
      return 'images';
    }
    // Default to products
    return 'products';
  });

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const newWidth = event.clientX;

    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.width.set(newWidth);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }
}
