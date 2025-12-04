import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from './products.model';
import { ProductsFirebase } from './products.firebase';
import { FoldersService } from '../folders/folders.service';
import { SPECIAL_FOLDERS } from '../folders/folders.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsFirabse = inject(ProductsFirebase);
  private foldersService = inject(FoldersService);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _products = signal<Product[]>([]); // Array of all products
  private _loading = signal<boolean>(false); // Loading state
  private _error = signal<string | null>(null); // Error state
  private _productsLoaded = signal<boolean>(false); // Track if products have been loaded

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  products = this._products.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of products
  productCount = computed(() => this._products().length);

  // Products filtered by folder
  filteredProducts = computed(() => {
    let products = this._products();
    const selectedFolder = this.foldersService.selectedFolder();

    // Filter by folder (same pattern as ImagesService)
    if (!selectedFolder) {
      return [];
    }

    if (selectedFolder.id === SPECIAL_FOLDERS.UNASSIGNED) {
      products = products.filter(p => !p.folderId);
    } else if (selectedFolder.id !== SPECIAL_FOLDERS.ROOT) {
      products = products.filter(p => p.folderId === selectedFolder.id);
    }

    return products;
  });

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

  // ========================================
  // ACTIONS - CRUD OPERATIONS
  // ========================================

  // Ensure products are loaded (only loads once per session)
  async ensureProductsLoaded(): Promise<void> {
    if (!this._productsLoaded()) {
      await this.loadProducts();
    }
  }

  // Load all products (always fetches from Firebase)
  async loadProducts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const products = await this.productsFirabse.getProducts();
      this._products.set(products);
      this._productsLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Create product
  async createProduct(product: Omit<Product, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const id = await this.productsFirabse.addProduct(product);
      // Optimistic update
      const newProduct: Product = { ...product, id };
      this._products.update(products => [...products, newProduct]);
    } catch (error) {
      this._error.set('Failed to create product');
      console.error('Error creating product:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Update product
  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    console.log('updateProduct', id, data);
    try {
      // Optimistic update
      const currentProducts = this._products();
      const updatedProducts = currentProducts.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      );
      this._products.set(updatedProducts);
      // Update in Firebase
      await this.productsFirabse.updateProduct(id, data);
    } catch (error) {
      this._error.set('Failed to update product');
      console.error('Error updating product:', error);
      // Reload products to revert optimistic update
      await this.loadProducts();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      this._products.update(products => products.filter(p => p.id !== id));

      // Delete from Firebase
      await this.productsFirabse.deleteProduct(id);
    } catch (error) {
      this._error.set('Failed to delete product');
      console.error('Error deleting product:', error);
      // Reload products to revert optimistic update
      await this.loadProducts();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ========================================
  // UI STATE ACTIONS
  // ========================================

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

  // ========================================
  // BATCH OPERATIONS
  // ========================================

  // Update multiple products with the same data
  async updateMultipleProducts(ids: string[], data: Partial<Product>): Promise<void> {
    if (ids.length === 0) return;

    this._loading.set(true);
    this._error.set(null);

    try {
      // 1. Optimistic update  - update local cache immediately
      this._products.update(products =>
        products.map(p => ids.includes(p.id!) ? { ...p, ...data } : p)
      );

      // 2. Sync to Firebase in background
      await Promise.all(ids.map(id => this.productsFirabse.updateProduct(id, data)));

    } catch (error) {
      this._error.set('Failed to update products');
      console.error('Error updating multiple products:', error);

      // On failure: reload all products from Firebase
      await this.loadProducts();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }
}
