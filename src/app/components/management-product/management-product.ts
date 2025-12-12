import { Component, inject, effect, signal, computed, OnInit } from '@angular/core';
import { DimensionFoldersService } from '../../features/dimensions/dimension-folders.service';
import { SPECIAL_DIM_FOLDERS } from '../../features/dimensions/dimensions.model';
import { ProductsService } from '../../features/products/products.service';
import { GlobalService } from '../../features/global/global.service';
import { ProductListItem } from './product-list-item/product-list-item';
import { FormCheckbox } from '../form/form-checkbox/form-checkbox';
@Component({
  selector: 'app-management-product',
  imports: [ProductListItem, FormCheckbox],
  templateUrl: './management-product.html',
  styleUrl: './management-product.scss',
})
export class ManagementProduct implements OnInit {
  private globalService = inject(GlobalService);
  private dimensionFoldersService = inject(DimensionFoldersService);
  private productsService = inject(ProductsService);

  // Expose services to template
  loading = this.globalService.loading;
  error = this.productsService.error;
  selectedNodeId = this.dimensionFoldersService.selectedNodeId;
  breadcrumb = this.dimensionFoldersService.breadcrumb;

  // Filtered products based on selected dimension node
  products = computed(() => {
    const allProducts = this.productsService.products();
    const selectedId = this.dimensionFoldersService.selectedNodeId();

    // No selection - show nothing
    if (!selectedId) {
      return [];
    }

    let filteredProducts: typeof allProducts = [];

    // Unassigned folder - show products without subCollectionId
    if (selectedId === SPECIAL_DIM_FOLDERS.UNASSIGNED) {
      filteredProducts = allProducts.filter(p => !p.subCollectionId);
    }
    // SubCollection selected (isDroppable) - show products with matching subCollectionId
    else if (this.dimensionFoldersService.isDroppable(selectedId)) {
      filteredProducts = allProducts.filter(p => p.subCollectionId === selectedId);
    }
    // Franchise or collection selected - show nothing (they are not selectable anyway)
    else {
      return [];
    }

    // Sort by order field
    return filteredProducts.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  // Selection state
  selectedProducts = signal<Set<string>>(new Set());
  selectAll = signal(false);

  // ============ EFFECTS ==================

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
    const total = this.products().length;
    const selected = this.selectedProducts().size;
    this.selectAll.set(total > 0 && selected === total);
  }

  // ============ ACTIONS ==================

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
    // Check if dragging a specific row
    const row = (event.target as HTMLElement).closest('tr');
    const productId = row?.getAttribute('data-product-id');

    // If dragging a row and it's not selected, select it
    if (productId && !this.isProductSelected(productId)) {
      this.toggleProductSelection(productId);
    }

    const selectedIds = Array.from(this.selectedProducts());

    // If nothing selected (shouldn't happen for row drag due to logic above, but possible for header), prevent drag
    if (selectedIds.length === 0) {
      event.preventDefault();
      return;
    }

    // Set drag data with all selected product IDs
    this.dimensionFoldersService.setDragData({
      type: 'products',
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

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load products only if not already loaded
    this.productsService.ensureProductsLoaded();
  }
}
