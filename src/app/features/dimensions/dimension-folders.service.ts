import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { FranchiseService } from './franchise/franchise.service';
import { CollectionService } from './collection/collection.service';
import { SubCollectionService } from './subcollection/subcollection.service';
import { ProductsService } from '../products/products.service';
import { GlobalService } from '../global/global.service';
import { ToastService } from '../toast/toast.service';
import { SPECIAL_DIM_FOLDERS } from './dimensions.model';


/**
 * Service for managing dimension selection and drag-drop operations.
 * Used by dimension-folders component and product-list.
 */
@Injectable({
  providedIn: 'root',
})
export class DimensionFoldersService {
  private franchiseService = inject(FranchiseService);
  private collectionService = inject(CollectionService);
  private subCollectionService = inject(SubCollectionService);
  private productsService = inject(ProductsService);
  private globalService = inject(GlobalService);
  private toastService = inject(ToastService);

  // ============ STATE ==================

  private _selectedNodeId = signal<string | null>(null);

  // ============ SELECTORS ==================

  selectedNodeId = this._selectedNodeId.asReadonly();

  // Breadcrumb for selected folder
  breadcrumb = computed(() => {
    const selectedId = this.selectedNodeId();

    if (!selectedId) return '';

    if (selectedId === SPECIAL_DIM_FOLDERS.UNASSIGNED) {
      return 'Unassigned';
    }

    // 1. Check SubCollection
    const subcollection = this.subCollectionService.subcollections().find(s => s.id === selectedId);
    if (subcollection) {
      const collection = this.collectionService.collections().find(c => c.id === subcollection.collectionId);
      const franchise = collection ? this.franchiseService.franchises().find(f => f.id === collection.franchiseId) : null;

      const franchiseName = franchise?.name?.en || 'Unknown Franchise';
      const collectionName = collection?.name?.en || 'Unknown Collection';
      const subcollectionName = subcollection.name?.en || 'Unknown SubCollection';

      return `${franchiseName} > ${collectionName} > ${subcollectionName}`;
    }

    // 2. Check Collection
    const collection = this.collectionService.collections().find(c => c.id === selectedId);
    if (collection) {
      const franchise = this.franchiseService.franchises().find(f => f.id === collection.franchiseId);
      const franchiseName = franchise?.name?.en || 'Unknown Franchise';
      const collectionName = collection.name?.en || 'Unknown Collection';

      return `${franchiseName} > ${collectionName}`;
    }

    // 3. Check Franchise
    const franchise = this.franchiseService.franchises().find(f => f.id === selectedId);
    if (franchise) {
      return franchise.name?.en || 'Unknown Franchise';
    }

    return '';
  });

  // ============ CONSTRUCTOR ==================

  constructor() {
    // Listen for folder drops and handle product updates
    effect(() => {
      const dropEvent = this.globalService.folderDrop();
      if (!dropEvent) return;

      const dragData = this.globalService.dragData();
      if (!dragData || dragData.type !== 'products') return;

      this.handleProductDrop(dropEvent.folderId, dragData.ids);
    });
  }

  // ============ ACTIONS ==================

  selectNode(nodeId: string) {
    this._selectedNodeId.set(nodeId);
  }

  clearSelection() {
    this._selectedNodeId.set(null);
  }

  // ============ DRAG AND DROP ==================

  /**
   * Handle product drop on a dimension node.
   * Collects dimension data and triggers the update.
   */
  async handleProductDrop(nodeId: string, productIds: string[]): Promise<void> {
    // Build update data based on target node
    const updateData: {
      subCollectionId?: string;
      collectionId?: string;
      franchiseId?: string;
      manufacturerId?: string;
    } = {};

    let targetName = '';

    if (nodeId === SPECIAL_DIM_FOLDERS.UNASSIGNED) {
      // Dropping on Unassigned clears all dimension IDs
      updateData.subCollectionId = undefined;
      updateData.collectionId = undefined;
      updateData.franchiseId = undefined;
      updateData.manufacturerId = undefined;
      targetName = 'Unassigned';
    } else {
      // Check if it's a subcollection
      const subcollection = this.subCollectionService.subcollections()
        .find(s => s.id === nodeId);

      if (!subcollection) return; // Not a valid drop target

      updateData.subCollectionId = subcollection.id;
      targetName = subcollection.name?.en || subcollection.name?.es || 'SubCollection';

      // Find parent collection to get related dimension IDs
      if (subcollection.collectionId) {
        const collection = this.collectionService.collections()
          .find(c => c.id === subcollection.collectionId);

        if (collection) {
          updateData.collectionId = collection.id;
          if (collection.franchiseId) updateData.franchiseId = collection.franchiseId;
          if (collection.manufacturerId) updateData.manufacturerId = collection.manufacturerId;
        }
      }
    }

    // Perform the update
    await this.updateProductsDimensions(productIds, updateData, targetName);

    // Clear drag data
    this.globalService.clearDragData();
    this.globalService.clearFolderDrop();
  }

  /**
   * Update products with the given dimension data.
   */
  private async updateProductsDimensions(
    productIds: string[],
    updateData: {
      subCollectionId?: string;
      collectionId?: string;
      franchiseId?: string;
      manufacturerId?: string;
    },
    targetName: string
  ): Promise<void> {
    try {
      await this.productsService.updateMultipleProducts(productIds, updateData);
      this.toastService.success(`Moved ${productIds.length} product(s) to "${targetName}"`);
    } catch (error) {
      this.toastService.error('Failed to move products');
    }
  }

  /**
   * Check if a node ID represents a droppable target
   */
  isDroppable(nodeId: string): boolean {
    // Unassigned is always droppable
    if (nodeId === SPECIAL_DIM_FOLDERS.UNASSIGNED) return true;

    // Check if it's a subcollection
    return this.subCollectionService.subcollections().some(s => s.id === nodeId);
  }
}
