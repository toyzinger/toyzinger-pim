import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from './products.model';
import { ProductsFirebase } from './products.firebase';

@Injectable({
  providedIn: 'root',
})
export class ProductsStore {
  private productsService = inject(ProductsFirebase);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _products = signal<Product[]>([]);
  private _selectedProduct = signal<Product | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _searchTerm = signal<string>('');
  private _filterByFolderId = signal<string | null>(null);

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  products = this._products.asReadonly();
  selectedProduct = this._selectedProduct.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  searchTerm = this._searchTerm.asReadonly();
  filterByFolderId = this._filterByFolderId.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of products
  productCount = computed(() => this._products().length);

  // Products filtered by search term
  filteredProducts = computed(() => {
    let products = this._products();
    const search = this._searchTerm().toLowerCase();

    // Filter by search term
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.collection?.toLowerCase().includes(search) ||
          p.sku?.toLowerCase().includes(search)
      );
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

  // Load all products
  async loadProducts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const products = await this.productsService.getProducts();
      this._products.set(products);
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
      const id = await this.productsService.addProduct(product);
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
    try {
      // Optimistic update
      const currentProducts = this._products();
      const updatedProducts = currentProducts.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      );
      this._products.set(updatedProducts);

      // Update in Firebase
      await this.productsService.updateProduct(id, data);

      // Update selected product if it's the one being updated
      if (this._selectedProduct()?.id === id) {
        this._selectedProduct.update(p => p ? { ...p, ...data } : null);
      }
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
      await this.productsService.deleteProduct(id);

      // Clear selected product if it's the one being deleted
      if (this._selectedProduct()?.id === id) {
        this._selectedProduct.set(null);
      }
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

  // Select product
  selectProduct(product: Product | null): void {
    this._selectedProduct.set(product);
  }

  // Set search term
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  // Clear search
  clearSearch(): void {
    this._searchTerm.set('');
  }

  // Set folder filter
  setFolderFilter(folderId: string | null): void {
    this._filterByFolderId.set(folderId);
  }

  // Clear all filters
  clearFilters(): void {
    this._searchTerm.set('');
    this._filterByFolderId.set(null);
  }

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

  // ========================================
  // SPECIALIZED QUERIES
  // ========================================

  // Load products by franchise
  async loadProductsByFranchise(franchiseId: number | string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const products = await this.productsService.getProductsByFranchise(franchiseId);
      this._products.set(products);
    } catch (error) {
      this._error.set('Failed to load products by franchise');
      console.error('Error loading products by franchise:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Load products by manufacturer
  async loadProductsByManufacturer(manufacturerId: number | string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const products = await this.productsService.getProductsByManufacturer(manufacturerId);
      this._products.set(products);
    } catch (error) {
      this._error.set('Failed to load products by manufacturer');
      console.error('Error loading products by manufacturer:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Load active products only
  async loadActiveProducts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const products = await this.productsService.getActiveProducts();
      this._products.set(products);
    } catch (error) {
      this._error.set('Failed to load active products');
      console.error('Error loading active products:', error);
    } finally {
      this._loading.set(false);
    }
  }
}
