import { Injectable, signal, computed, inject } from '@angular/core';
import { DimFranchise } from '../dimensions.model';
import { FranchiseFirebase } from './franchise.firebase';
import { ToastService } from '../../toast/toast.service';
import { GlobalService } from '../../global/global.service';

@Injectable({
  providedIn: 'root',
})
export class FranchiseService {
  private franchiseFirebase = inject(FranchiseFirebase);
  private toastService = inject(ToastService);
  private globalService = inject(GlobalService);

  private readonly STORAGE_KEY = 'selectedFranchiseId';

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _franchises = signal<DimFranchise[]>([]); // Array of all franchises
  private _error = signal<string | null>(null); // Error state
  private _franchisesLoaded = signal<boolean>(false); // Track if franchises have been loaded
  private loadingPromise: Promise<void> | null = null; // Cache loading promise to prevent concurrent calls
  private _selectedFranchiseId = signal<string>(
    this.globalService.getLocalStorage(this.STORAGE_KEY, '')
  ); // Global selected franchise ID (persisted)

  // ============ SELECTORS (Public readonly) ============

  franchises = this._franchises.asReadonly();
  error = this._error.asReadonly();
  selectedFranchiseId = this._selectedFranchiseId.asReadonly();

  // ============ COMPUTED VALUES ============

  // Total count of franchises
  franchiseCount = computed(() => this._franchises().length);

  // Get franchise by ID
  getFranchiseById = computed(() => {
    return (id: string) => this._franchises().find(f => f.id === id);
  });

  // ============ ACTIONS - CRUD OPERATIONS ============

  // Ensure franchises are loaded (only loads once per session)
  async ensureFranchisesLoaded(): Promise<void> {
    // If already loaded, return immediately
    if (this._franchisesLoaded()) {
      return;
    }

    // If currently loading, return the cached promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading and cache the promise
    this.loadingPromise = this.loadFranchises();

    try {
      await this.loadingPromise;
    } finally {
      // Clear the promise cache after loading completes (success or failure)
      this.loadingPromise = null;
    }
  }

  // Load all franchises (always fetches from Firebase)
  async loadFranchises(): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      const franchises = await this.franchiseFirebase.getFranchises();
      this._franchises.set(franchises);
      this._franchisesLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load franchises');
      console.error('Error loading franchises:', error);
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Create franchise
  async createFranchise(franchise: Omit<DimFranchise, 'id'>): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      const id = await this.franchiseFirebase.addFranchise(franchise);
      // Optimistic update
      const newFranchise: DimFranchise = { ...franchise, id };
      this._franchises.update(franchises => [...franchises, newFranchise]);
      this.toastService.success(`Franchise Created: ${franchise.name.en}`);
    } catch (error) {
      this._error.set('Failed to create franchise');
      console.error('Error creating franchise:', error);
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Update franchise
  async updateFranchise(id: string, data: Partial<DimFranchise>): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      // Optimistic update
      const currentFranchises = this._franchises();
      const updatedFranchises = currentFranchises.map(f =>
        f.id === id ? { ...f, ...data } : f
      );
      this._franchises.set(updatedFranchises);

      // Update in Firebase
      await this.franchiseFirebase.updateFranchise(id, data);
      this.toastService.success(`Franchise Updated: ${data.name}`);
    } catch (error) {
      this._error.set('Failed to update franchise');
      console.error('Error updating franchise:', error);
      // Reload franchises to revert optimistic update
      await this.loadFranchises();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }

  // Delete franchise
  async deleteFranchise(id: string): Promise<void> {
    this.globalService.activateLoading();
    this._error.set(null);
    try {
      // Optimistic update
      this._franchises.update(franchises => franchises.filter(f => f.id !== id));

      // Delete from Firebase
      await this.franchiseFirebase.deleteFranchise(id);
      this.toastService.success(`Franchise Deleted: ${id}`);
    } catch (error) {
      this._error.set('Failed to delete franchise');
      console.error('Error deleting franchise:', error);
      // Reload franchises to revert optimistic update
      await this.loadFranchises();
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

  // Set globally selected franchise ID
  setSelectedFranchiseId(id: string): void {
    this._selectedFranchiseId.set(id);
    this.globalService.setLocalStorage(this.STORAGE_KEY, id);
  }

  // Clear globally selected franchise ID
  clearSelectedFranchiseId(): void {
    this._selectedFranchiseId.set('');
    this.globalService.removeLocalStorage(this.STORAGE_KEY);
  }

  // ========================================
  // BATCH OPERATIONS
  // ========================================

  // Update multiple franchises with the same data
  async updateMultipleFranchises(ids: string[], data: Partial<DimFranchise>): Promise<void> {
    if (ids.length === 0) return;

    this.globalService.activateLoading();
    this._error.set(null);

    try {
      // 1. Optimistic update - update local cache immediately
      this._franchises.update(franchises =>
        franchises.map(f => ids.includes(f.id!) ? { ...f, ...data } : f)
      );

      // 2. Sync to Firebase in background
      await Promise.all(ids.map(id => this.franchiseFirebase.updateFranchise(id, data)));
      this.toastService.success(`Franchises Updated: ${ids.length}`);
    } catch (error) {
      this._error.set('Failed to update franchises');
      console.error('Error updating multiple franchises:', error);

      // On failure: reload all franchises from Firebase
      await this.loadFranchises();
      throw error;
    } finally {
      this.globalService.deactivateLoading();
    }
  }
}
