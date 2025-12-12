import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { FranchiseService } from './franchise/franchise.service';
import { CollectionService } from './collection/collection.service';
import { SubCollectionService } from './subcollection/subcollection.service';
import { ProductsService } from '../products/products.service';
import { ImagesService } from '../pimages/pimages.service';
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
  private imagesService = inject(ImagesService);
  private globalService = inject(GlobalService);

  // ============ STATE ==================

  private readonly STORAGE_KEY = 'dim_folder_selection';
  private readonly EXPANDED_STORAGE_KEY = 'dim_folder_expanded';

  private _selectedNodeId = signal<string | null>(
    this.globalService.getLocalStorage<string | null>(this.STORAGE_KEY, null));
  private _expandedNodeIds = signal<Set<string>>(
    new Set(this.globalService.getLocalStorage<string[]>(this.EXPANDED_STORAGE_KEY, []))
  );

  // ============ SELECTORS ==================

  selectedNodeId = this._selectedNodeId.asReadonly();
  expandedNodeIds = this._expandedNodeIds.asReadonly();

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

  // ============ EFFECTS ==================

  constructor() {
    effect(() => this.handleFolderDropEffect());
    effect(() => this.persistExpandedNodesToStorage());
  }

  private handleFolderDropEffect() {
    const dropEvent = this.globalService.folderDrop();
    if (!dropEvent) return;

    const dragData = this.globalService.dragData();
    if (!dragData) return;

    // Delegate to appropriate handler
    if (dragData.type === 'products') {
      this.handleProductDrop(dropEvent.folderId, dragData.ids);
    } else if (dragData.type === 'images') {
      this.handleImageDrop(dropEvent.folderId, dragData.ids);
    }

    // Select the drop target node (common for all drops)
    this.selectNode(dropEvent.folderId);

    // Clear drag data (common for all drops)
    this.globalService.clearDragData();
    this.globalService.clearFolderDrop();
  }

  private persistExpandedNodesToStorage() {
    const expanded = this._expandedNodeIds();
    this.globalService.setLocalStorage(this.EXPANDED_STORAGE_KEY, Array.from(expanded));
  }

  // ============ ACTIONS ==================

  selectNode(nodeId: string) {
    this._selectedNodeId.set(nodeId);
    this.globalService.setLocalStorage(this.STORAGE_KEY, nodeId);
  }

  clearSelection() {
    this._selectedNodeId.set(null);
    this.globalService.removeLocalStorage(this.STORAGE_KEY);
  }

  toggleNode(nodeId: string) {
    this._expandedNodeIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }

  expandNode(nodeId: string) {
    this._expandedNodeIds.update(set => {
      const newSet = new Set(set);
      newSet.add(nodeId);
      return newSet;
    });
  }

  collapseNode(nodeId: string) {
    this._expandedNodeIds.update(set => {
      const newSet = new Set(set);
      newSet.delete(nodeId);
      return newSet;
    });
  }

  collapseAll() {
    this._expandedNodeIds.set(new Set());
  }

  expandNodes(nodeIds: Set<string>) {
    this._expandedNodeIds.update(current => {
      const next = new Set(current);
      nodeIds.forEach(id => next.add(id));
      return next;
    });
  }

  // ============ DRAG AND DROP ==================

  /**   * Check if a node ID represents a droppable target
   */
  isDroppable(nodeId: string): boolean {
    // Unassigned is always droppable
    if (nodeId === SPECIAL_DIM_FOLDERS.UNASSIGNED) return true;

    // Check if it's a subcollection
    return this.subCollectionService.subcollections().some(s => s.id === nodeId);
  }

  /**
   * Handle product drop on a dimension node.
   * Delegates the update logic to ProductsService.
   */
  async handleProductDrop(nodeId: string, productIds: string[]): Promise<void> {
    await this.productsService.updateProductsByDrop(nodeId, productIds);
  }

  /**
   * Handle image drop on a dimension node.
   * Delegates the update logic to ImagesService.
   */
  async handleImageDrop(nodeId: string, imageIds: string[]): Promise<void> {
    await this.imagesService.updateImagesByDrop(nodeId, imageIds);
  }
}
