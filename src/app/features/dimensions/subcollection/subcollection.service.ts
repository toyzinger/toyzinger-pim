import { Injectable, signal, computed, inject } from '@angular/core';
import { DimSubCollection } from '../dimensions.model';
import { SubCollectionFirebase } from './subcollection.firebase';
import { ToastService } from '../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SubCollectionService {
  private subcollectionFirebase = inject(SubCollectionFirebase);
  private toastService = inject(ToastService);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _subcollections = signal<DimSubCollection[]>([]); // Array of all subcollections
  private _loading = signal<boolean>(false); // Loading state
  private _error = signal<string | null>(null); // Error state
  private _subcollectionsLoaded = signal<boolean>(false); // Track if subcollections have been loaded

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  subcollections = this._subcollections.asReadonly();
  loading = this._loading.asReadonly();
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
    if (!this._subcollectionsLoaded()) {
      await this.loadSubCollections();
    }
  }

  // Load all subcollections (always fetches from Firebase)
  async loadSubCollections(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const subcollections = await this.subcollectionFirebase.getSubCollections();
      this._subcollections.set(subcollections);
      this._subcollectionsLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load subcollections');
      console.error('Error loading subcollections:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Create subcollection
  async createSubCollection(subcollection: Omit<DimSubCollection, 'id'>): Promise<void> {
    this._loading.set(true);
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
      this._loading.set(false);
    }
  }

  // Update subcollection
  async updateSubCollection(id: string, data: Partial<DimSubCollection>): Promise<void> {
    this._loading.set(true);
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
      this.toastService.success(`SubCollection Updated: ${data.name?.en}`);
    } catch (error) {
      this._error.set('Failed to update subcollection');
      console.error('Error updating subcollection:', error);
      // Reload subcollections to revert optimistic update
      await this.loadSubCollections();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Delete subcollection
  async deleteSubCollection(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
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
