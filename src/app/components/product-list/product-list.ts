import { Component, inject, effect, signal, OnInit } from '@angular/core';
import { FoldersService } from '../../features/folders/folders.service';
import { SPECIAL_FOLDERS } from '../../features/folders/folders.model';
import { ProductsService } from '../../features/products/products.service';
import { GlobalService } from '../../features/global/global.service';
import { ToastService } from '../../features/toast/toast.service';
import { ProductListItem } from './product-list-item/product-list-item';
import { FormCheckbox } from '../form/form-checkbox/form-checkbox';

@Component({
  selector: 'app-product-list',
  imports: [ProductListItem, FormCheckbox],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private foldersService = inject(FoldersService);
  private productsService = inject(ProductsService);
  private global = inject(GlobalService);
  private toastService = inject(ToastService);

  // Expose services to template
  products = this.productsService.filteredProducts;
  loading = this.productsService.loading;
  error = this.productsService.error;
  selectedFolder = this.foldersService.selectedFolder;

  // Selection state
  selectedProducts = signal<Set<string>>(new Set());
  selectAll = signal(false);

  constructor() {
    // Clear selection when folder changes
    effect(() => {
      const folder = this.foldersService.selectedFolder();
      if (folder) {
        this.clearSelection();
      }
    });

    // Sync selectAll checkbox with actual selection
    effect(() => {
      const total = this.products().length;
      const selected = this.selectedProducts().size;

      // Only set to true if we have items AND all are selected
      this.selectAll.set(total > 0 && selected === total);
    });

    // Listen for folder drop events
    effect(() => {
      const dropEvent = this.global.folderDrop();
      const dragData = this.global.dragData();

      // Only handle if we're dragging products AND there's a drop event
      if (dropEvent && dragData?.type === 'products') {
        // Handle the drop
        this.handleFolderDrop(dropEvent.folderId, dragData.ids);

        // Clear the drop event to prevent re-triggering
        this.global.clearFolderDrop();
      }
    });
  }

  ngOnInit() {
    // Load products only if not already loaded
    this.productsService.ensureProductsLoaded();
  }

  toggleSelectAll() {
    const allSelected = this.selectAll();

    if (allSelected) {
      // Deselect all
      this.selectedProducts.set(new Set());
    } else {
      // Select all
      const allIds = this.products().map(p => p.id!);
      this.selectedProducts.set(new Set(allIds));
    }
  }

  toggleProductSelection(productId: string) {
    const current = new Set(this.selectedProducts());

    if (current.has(productId)) {
      current.delete(productId);
    } else {
      current.add(productId);
    }

    this.selectedProducts.set(current);
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts().has(productId);
  }

  clearSelection() {
    this.selectedProducts.set(new Set());
  }

  onDragStart(event: DragEvent) {
    // Get the dragged row's product ID from the event target
    const row = (event.target as HTMLElement).closest('tr');
    const productId = row?.getAttribute('data-product-id');

    if (!productId) return;

    // If dragging an unselected product, select it first
    if (!this.isProductSelected(productId)) {
      this.toggleProductSelection(productId);
    }

    // Set drag data with all selected product IDs
    const selectedIds = Array.from(this.selectedProducts());
    this.global.setDragData({
      type: 'products',
      ids: selectedIds,
    });

    // Create custom drag preview
    this.global.createDragPreview(event, selectedIds.length, 'inventory_2', 'product');
  }

  onDragEnd() {
    this.global.clearDragData();
  }

  /**
   * Handle folder drop event by updating products
   */
  async handleFolderDrop(folderId: string, productIds: string[]) {
    try {
      // Special handling for UNASSIGNED folder - remove folderId assignment
      if (folderId === SPECIAL_FOLDERS.UNASSIGNED) {
        await this.productsService.updateMultipleProducts(productIds, { folderId: undefined });
      } else {
        await this.productsService.updateMultipleProducts(productIds, { folderId });
      }

      const count = productIds.length;
      const folderName = folderId === SPECIAL_FOLDERS.UNASSIGNED ? 'unassigned' : 'folder';
      this.toastService.success(`Moved ${count} product${count > 1 ? 's' : ''} to ${folderName}`);

      // Clear selection after successful move
      this.clearSelection();
    } catch (error) {
      this.toastService.error('Failed to move products');
      console.error('Error moving products:', error);
    }
  }
}
