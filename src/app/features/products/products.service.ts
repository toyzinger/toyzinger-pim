import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from './products.model';
import { ProductsFirebase } from './products.firebase';
import { SubCollectionService } from '../dimensions/subcollection/subcollection.service';
import { CollectionService } from '../dimensions/collection/collection.service';
import { SPECIAL_DIM_FOLDERS } from '../dimensions/dimensions.model';
import { ToastService } from '../toast/toast.service';
import { GlobalService } from '../global/global.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsFirebase = inject(ProductsFirebase);
  private subCollectionService = inject(SubCollectionService);
  private collectionService = inject(CollectionService);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);

  // =============== STATE (Private signals) =========================

  private _products = signal<Product[]>([]); // Array of all products
  private _productsLoaded = signal<boolean>(false); // Track if products have been loaded

  // ============== SELECTORS (Public readonly) ========================

  products = this._products.asReadonly();

  // TODO REMOVE: handle error globally
  private _error = signal<string | null>(null); // Error state
  error = this._error.asReadonly();

  // ================ COMPUTED VALUES ========================

  // Total count of products
  productCount = computed(() => this._products().length);

  // Only active products
  activeProducts = computed(() =>
    this._products().filter(p => p.isActive)
  );

  // Only inactive products
  inactiveProducts = computed(() =>
    this._products().filter(p => !p.isActive)
  );

  // Get product by ID
  getProductById = computed(() => {
    return (id: string) => this._products().find(p => p.id === id);
  });

  // ================== ACTIONS - CRUD OPERATIONS ===========================

  // Ensure products are loaded (only loads once per session)
  async ensureProductsLoaded(): Promise<void> {
    if (!this._productsLoaded()) {
      await this.loadProducts();
    }
  }

  // Load all products (always fetches from Firebase)
  async loadProducts(): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      const products = await this.productsFirebase.getProducts();
      this._products.set(products);
      this._productsLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Create product
  async createProduct(product: Omit<Product, 'id'>): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      const id = await this.productsFirebase.addProduct(product);
      // Optimistic update
      const newProduct: Product = { ...product, id };
      this._products.update(products => [...products, newProduct]);
    } catch (error) {
      this._error.set('Failed to create product');
      console.error('Error creating product:', error);
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Update product
  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    // console.log('updateProduct', id, data);
    try {
      // Optimistic update
      const currentProducts = this._products();
      const updatedProducts = currentProducts.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      );
      this._products.set(updatedProducts);
      // Update in Firebase
      await this.productsFirebase.updateProduct(id, data);
    } catch (error) {
      this._error.set('Failed to update product');
      console.error('Error updating product:', error);
      // Reload products to revert optimistic update
      await this.loadProducts();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      // Optimistic update
      this._products.update(products => products.filter(p => p.id !== id));

      // Delete from Firebase
      await this.productsFirebase.deleteProduct(id);
    } catch (error) {
      this._error.set('Failed to delete product');
      console.error('Error deleting product:', error);
      // Reload products to revert optimistic update
      await this.loadProducts();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // =============== UI STATE ACTIONS =========================

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

  // =============== BATCH OPERATIONS =========================

  // Update multiple products with the same data
  async updateMultipleProducts(ids: string[], data: Partial<Product>): Promise<void> {
    if (ids.length === 0) return;

    this.globalService.activateLoading();
    this._error.set(null);

    try {
      // 1. Optimistic update  - update local cache immediately
      this._products.update(products =>
        products.map(p => ids.includes(p.id!) ? { ...p, ...data } : p)
      );
      // 2. Sync to Firebase in background
      await Promise.all(ids.map(id => this.productsFirebase.updateProduct(id, data)));

    } catch (error) {
      this._error.set('Failed to update products');
      console.error('Error updating multiple products:', error);
      // On failure: reload all products from Firebase
      await this.loadProducts();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  /**
   * Update products when dropped on a dimension node (folder).
   * Handles both UNASSIGNED (clears dimensions) and subcollection drops.
   * @param dimensionNodeId - The dimension node ID (UNASSIGNED or subcollection ID)
   * @param productIds - Array of product IDs to update
   */
  async updateProductsByDrop(
    dimensionNodeId: string,
    productIds: string[]
  ): Promise<void> {

    if (productIds.length === 0) return;

    // Build update data based on target node
    const updateData: Partial<Product> = {};
    let targetName = '';

    if (dimensionNodeId === SPECIAL_DIM_FOLDERS.UNASSIGNED) {
      // Dropping on Unassigned clears all dimension IDs
      updateData.subCollectionId = undefined;
      updateData.collectionId = undefined;
      updateData.franchiseId = undefined;
      updateData.manufacturerId = undefined;
      targetName = 'Unassigned';
    } else {
      // Check if it's a subcollection
      const subcollection = this.subCollectionService.subcollections().find(s => s.id === dimensionNodeId);

      if (!subcollection) {
        // Not a valid drop target
        return;
      }

      updateData.subCollectionId = subcollection.id;
      targetName = subcollection.name?.en || subcollection.name?.es || 'SubCollection';

      // Find parent collection to get related dimension IDs
      if (subcollection.collectionId) {
        const collection = this.collectionService.collections().find(c => c.id === subcollection.collectionId);

        if (collection) {
          updateData.collectionId = collection.id;
          if (collection.franchiseId) updateData.franchiseId = collection.franchiseId;
          if (collection.manufacturerId) updateData.manufacturerId = collection.manufacturerId;
        }
      }
    }

    // Perform the update
    try {
      await this.updateMultipleProducts(productIds, updateData);
      this.toastService.success(`Moved ${productIds.length} product(s) to "${targetName}"`);
    } catch (error) {
      this.toastService.error('Failed to move products');
    }
  }

  /**
   * Remove dimension references from products with a specific subcollectionId
   * Clears subcollectionId, collectionId, franchiseId and manufacturerId
   * @param subcollectionId - The subcollection ID to search for
   */
  async clearProductsBySubcollection(subcollectionId: string): Promise<void> {
    if (!subcollectionId) return;

    this.globalService.activateLoading();
    this._error.set(null);

    try {
      // Find all products with this subcollectionId
      const productsToUpdate = this._products().filter(p => p.subCollectionId === subcollectionId);

      if (productsToUpdate.length === 0) {
        this.globalService.deactivateLoading();
        return;
      }

      const ids = productsToUpdate.map(p => p.id!);

      // Data to clear dimension references
      const data: Partial<Product> = {
        subCollectionId: undefined,
        collectionId: undefined,
        franchiseId: undefined,
        manufacturerId: undefined,
      };

      // 1. Optimistic update - update local cache immediately
      this._products.update(products =>
        products.map(p =>
          ids.includes(p.id!)
            ? { ...p, ...data }
            : p
        )
      );
      // 2. Sync to Firebase in background
      await Promise.all(ids.map(id => this.productsFirebase.updateProduct(id, data)));

    } catch (error) {
      this._error.set('Failed to clear dimension references');
      console.error('Error clearing dimension references:', error);
      // On failure: reload all products from Firebase
      await this.loadProducts();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }
}
