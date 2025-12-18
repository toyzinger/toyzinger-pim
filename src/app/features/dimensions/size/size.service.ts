import { inject, Injectable, signal, computed } from '@angular/core';
import { SizeFirebase } from './size.firebase';
import { DimSize } from '../dimensions.model';
import { ToastService } from '../../toast/toast.service';
import { GlobalService } from '../../global/global.service';

@Injectable({
  providedIn: 'root',
})
export class SizeService {
  private sizeFirebase = inject(SizeFirebase);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);

  private readonly STORAGE_KEY = 'selectedSizeId';

  // Private state
  private _sizes = signal<DimSize[]>([]);
  private _error = signal<string | null>(null);
  private _isLoaded = signal(false);
  private loadingPromise: Promise<void> | null = null; // Cache loading promise to prevent concurrent calls
  private _selectedSizeId = signal<string>(
    this.globalService.getLocalStorage(this.STORAGE_KEY, '')
  ); // Global selected size ID (persisted)

  // Public readonly selectors
  sizes = this._sizes.asReadonly();
  error = this._error.asReadonly();
  loading = this.globalService.loading;
  selectedSizeId = this._selectedSizeId.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Computed: get size by ID
  getSizeById = computed(() => {
    return (id: string) => this._sizes().find(s => s.id === id);
  });

  // Total count of sizes
  sizeCount = computed(() => this._sizes().length);

  /**
   * Ensure sizes are loaded (only loads once per session)
   */
  async ensureSizesLoaded(): Promise<void> {
    // If already loaded, return immediately
    if (this._isLoaded()) {
      return;
    }

    // If currently loading, return the cached promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading and cache the promise
    this.loadingPromise = this.loadSizes();

    try {
      await this.loadingPromise;
    } finally {
      // Clear the promise cache after loading completes (success or failure)
      this.loadingPromise = null;
    }
  }

  /**
   * Load all sizes from Firebase
   */
  async loadSizes(): Promise<void> {
    this.globalService.activateLoading();
    try {
      const sizes = await this.sizeFirebase.getSizes();
      this._sizes.set(sizes);
      this._error.set(null);
      this._isLoaded.set(true);
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load sizes');
      this.toastService.error('Failed to load sizes');
      console.error('Error loading sizes:', err);
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  /**
   * Create a new size
   */
  async createSize(size: Omit<DimSize, 'id'>): Promise<void> {
    this.globalService.activateLoading();
    try {
      const id = await this.sizeFirebase.createSize(size);
      const newSize: DimSize = { id, ...size };
      this._sizes.update(sizes => [...sizes, newSize]);
      this.toastService.success('Size created successfully');
    } catch (err: any) {
      this._error.set(err.message || 'Failed to create size');
      this.toastService.error('Failed to create size');
      throw err;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  /**
   * Update an existing size
   */
  async updateSize(id: string, updates: Partial<DimSize>): Promise<void> {
    this.globalService.activateLoading();
    try {
      await this.sizeFirebase.updateSize(id, updates);
      this._sizes.update(sizes =>
        sizes.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
      this.toastService.success('Size updated successfully');
    } catch (err: any) {
      this._error.set(err.message || 'Failed to update size');
      this.toastService.error('Failed to update size');
      throw err;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  /**
   * Delete a size
   */
  async deleteSize(id: string): Promise<void> {
    this.globalService.activateLoading();
    try {
      await this.sizeFirebase.deleteSize(id);
      this._sizes.update(sizes => sizes.filter(s => s.id !== id));
      this.toastService.success('Size deleted successfully');
    } catch (err: any) {
      this._error.set(err.message || 'Failed to delete size');
      this.toastService.error('Failed to delete size');
      throw err;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // ========================================
  // UI STATE ACTIONS
  // ========================================

  // Set globally selected size ID
  setSelectedSizeId(id: string): void {
    this._selectedSizeId.set(id);
    this.globalService.setLocalStorage(this.STORAGE_KEY, id);
  }

  // Clear globally selected size ID
  clearSelectedSizeId(): void {
    this._selectedSizeId.set('');
    this.globalService.removeLocalStorage(this.STORAGE_KEY);
  }
}
