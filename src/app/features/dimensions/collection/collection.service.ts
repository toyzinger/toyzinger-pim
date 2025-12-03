import { Injectable, signal, computed, inject } from '@angular/core';
import { DimCollection } from '../dimensions.model';
import { CollectionFirebase } from './collection.firebase';
import { ToastService } from '../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private collectionFirebase = inject(CollectionFirebase);
  private toastService = inject(ToastService);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _collections = signal<DimCollection[]>([]); // Array of all collections
  private _loading = signal<boolean>(false); // Loading state
  private _error = signal<string | null>(null); // Error state
  private _collectionsLoaded = signal<boolean>(false); // Track if collections have been loaded
  private loadingPromise: Promise<void> | null = null; // Cache loading promise to prevent concurrent calls

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  collections = this._collections.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of collections
  collectionCount = computed(() => this._collections().length);

  // Get collection by ID
  getCollectionById = computed(() => {
    return (id: string) => this._collections().find(c => c.id === id);
  });

  // Collections sorted by order
  sortedCollections = computed(() =>
    [...this._collections()].sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  // ========================================
  // ACTIONS - CRUD OPERATIONS
  // ========================================

  // Ensure collections are loaded (only loads once per session)
  async ensureCollectionsLoaded(): Promise<void> {
    // If already loaded, return immediately
    if (this._collectionsLoaded()) {
      return;
    }

    // If currently loading, return the cached promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading and cache the promise
    this.loadingPromise = this.loadCollections();

    try {
      await this.loadingPromise;
    } finally {
      // Clear the promise cache after loading completes (success or failure)
      this.loadingPromise = null;
    }
  }

  // Load all collections (always fetches from Firebase)
  async loadCollections(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const collections = await this.collectionFirebase.getCollections();
      this._collections.set(collections);
      this._collectionsLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load collections');
      console.error('Error loading collections:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Create collection
  async createCollection(collection: Omit<DimCollection, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const id = await this.collectionFirebase.addCollection(collection);
      // Optimistic update
      const newCollection: DimCollection = { ...collection, id };
      this._collections.update(collections => [...collections, newCollection]);
      this.toastService.success(`Collection Created: ${collection.name}`);
    } catch (error) {
      this._error.set('Failed to create collection');
      console.error('Error creating collection:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Update collection
  async updateCollection(id: string, data: Partial<DimCollection>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      const currentCollections = this._collections();
      const updatedCollections = currentCollections.map(c =>
        c.id === id ? { ...c, ...data } : c
      );
      this._collections.set(updatedCollections);

      // Update in Firebase
      await this.collectionFirebase.updateCollection(id, data);
      this.toastService.success(`Collection Updated: ${data.name}`);
    } catch (error) {
      this._error.set('Failed to update collection');
      console.error('Error updating collection:', error);
      // Reload collections to revert optimistic update
      await this.loadCollections();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Delete collection
  async deleteCollection(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      this._collections.update(collections => collections.filter(c => c.id !== id));

      // Delete from Firebase
      await this.collectionFirebase.deleteCollection(id);
      this.toastService.success(`Collection Deleted: ${id}`);
    } catch (error) {
      this._error.set('Failed to delete collection');
      console.error('Error deleting collection:', error);
      // Reload collections to revert optimistic update
      await this.loadCollections();
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
}