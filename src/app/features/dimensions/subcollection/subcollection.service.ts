import { Injectable, signal, computed, inject } from '@angular/core';
import { DimSubCollection } from '../dimensions.model';
import { SubCollectionFirebase } from './subcollection.firebase';
import { ToastService } from '../../toast/toast.service';
import { GlobalService } from '../../global/global.service';

@Injectable({
  providedIn: 'root',
})
export class SubCollectionService {
  private subcollectionFirebase = inject(SubCollectionFirebase);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);

  private readonly STORAGE_KEY = 'selectedSubCollectionId';

  // ========================================
  // STATE (Private signals)
  // ========================================

  // Array of all subcollections
  private _subcollections = signal<DimSubCollection[]>([]);
  // Track if subcollections have been loaded
  private _subcollectionsLoaded = signal<boolean>(false);
  // Cache loading promise to prevent concurrent calls
  private loadingPromise: Promise<void> | null = null;
  // LocalStorage selected subcollectionId (persisted)
  private _selectedSubCollectionId = signal<string>(
    this.globalService.getLocalStorage(this.STORAGE_KEY, '')
  );

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  subcollections = this._subcollections.asReadonly();
  selectedSubCollectionId = this._selectedSubCollectionId.asReadonly();

  // TODO REMOVE: handle error globally
  private _error = signal<string | null>(null);
  error = this._error.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of subcollections
  subcollectionCount = computed(() => this._subcollections().length);

  // Get subcollection by ID
  getSubCollectionById = computed(() => {
    return (id: string) => this._subcollections().find(sc => sc.id === id);
  });

  // SubCollections sorted by order
  sortedSubCollections = computed(() =>
    [...this._subcollections()].sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  // ========================================
  // ACTIONS - CRUD OPERATIONS
  // ========================================

  // Ensure subcollections are loaded (only loads once per session)
  async ensureSubCollectionsLoaded(): Promise<void> {
    // If already loaded, return immediately
    if (this._subcollectionsLoaded()) {
      return;
    }

    // If currently loading, return the cached promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading and cache the promise
    this.loadingPromise = this.loadSubCollections();

    try {
      await this.loadingPromise;
    } finally {
      // Clear the promise cache after loading completes (success or failure)
      this.loadingPromise = null;
    }
  }

  // Load all subcollections (always fetches from Firebase)
  async loadSubCollections(): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      const subcollections = await this.subcollectionFirebase.getSubCollections();
      this._subcollections.set(subcollections);
      this._subcollectionsLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load subcollections');
      console.error('Error loading subcollections:', error);
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Create subcollection
  async createSubCollection(subcollection: Omit<DimSubCollection, 'id'>): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      const id = await this.subcollectionFirebase.addSubCollection(subcollection);
      // Optimistic update
      const newSubCollection: DimSubCollection = { ...subcollection, id };
      this._subcollections.update(subcollections => [...subcollections, newSubCollection]);
      this.toastService.success(`SubCollection Created: ${subcollection.name.en}`);
    } catch (error) {
      this._error.set('Failed to create subcollection');
      console.error('Error creating subcollection:', error);
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Update subcollection
  async updateSubCollection(id: string, data: Partial<DimSubCollection>): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      // Optimistic update
      const currentSubCollections = this._subcollections();
      const updatedSubCollections = currentSubCollections.map(sc =>
        sc.id === id ? { ...sc, ...data } : sc
      );
      this._subcollections.set(updatedSubCollections);

      // Update in Firebase
      await this.subcollectionFirebase.updateSubCollection(id, data);
      const name = data.name ? data.name.en || data.name.es : '';
      this.toastService.success(`SubCollection Updated: ${name}`);
    } catch (error) {
      this._error.set('Failed to update subcollection');
      console.error('Error updating subcollection:', error);
      // Reload subcollections to revert optimistic update
      await this.loadSubCollections();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Delete subcollection
  async deleteSubCollection(id: string): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      // Clear selected subcollection if it's the one being deleted
      if (this._selectedSubCollectionId() === id) {
        this.clearSelectedSubCollectionId();
      }
      // Optimistic update
      this._subcollections.update(subcollections => subcollections.filter(sc => sc.id !== id));
      // Delete from Firebase
      await this.subcollectionFirebase.deleteSubCollection(id);
      this.toastService.success(`SubCollection Deleted: ${id}`);
    } catch (error) {
      this._error.set('Failed to delete subcollection');
      console.error('Error deleting subcollection:', error);
      // Reload subcollections to revert optimistic update
      await this.loadSubCollections();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // ========================================
  // UI STATE ACTIONS
  // ========================================

  // Clear error
  clearError(): void {
    this._error.set(null);
  }

  // Set globally selected subcollection ID
  setSelectedSubCollectionId(id: string): void {
    this._selectedSubCollectionId.set(id);
    this.globalService.setLocalStorage(this.STORAGE_KEY, id);
  }

  // Clear globally selected subcollection ID
  clearSelectedSubCollectionId(): void {
    this._selectedSubCollectionId.set('');
    this.globalService.removeLocalStorage(this.STORAGE_KEY);
  }
}
