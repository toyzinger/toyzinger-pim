import { Injectable, signal, computed, inject } from '@angular/core';
import { DimManufacturer } from '../dimensions.model';
import { ManufacturerFirebase } from './manufacturer.firebase';
import { ToastService } from '../../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturerService {
  private manufacturerFirebase = inject(ManufacturerFirebase);
  private toastService = inject(ToastService);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _manufacturers = signal<DimManufacturer[]>([]); // Array of all manufacturers
  private _loading = signal<boolean>(false); // Loading state
  private _error = signal<string | null>(null); // Error state
  private _manufacturersLoaded = signal<boolean>(false); // Track if manufacturers have been loaded
  private loadingPromise: Promise<void> | null = null; // Cache loading promise to prevent concurrent calls

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  manufacturers = this._manufacturers.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Total count of manufacturers
  manufacturerCount = computed(() => this._manufacturers().length);

  // Get manufacturer by ID
  getManufacturerById = computed(() => {
    return (id: string) => this._manufacturers().find(m => m.id === id);
  });

  // ========================================
  // ACTIONS - CRUD OPERATIONS
  // ========================================

  // Ensure manufacturers are loaded (only loads once per session)
  async ensureManufacturersLoaded(): Promise<void> {
    // If already loaded, return immediately
    if (this._manufacturersLoaded()) {
      return;
    }

    // If currently loading, return the cached promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading and cache the promise
    this.loadingPromise = this.loadManufacturers();

    try {
      await this.loadingPromise;
    } finally {
      // Clear the promise cache after loading completes (success or failure)
      this.loadingPromise = null;
    }
  }

  // Load all manufacturers (always fetches from Firebase)
  async loadManufacturers(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const manufacturers = await this.manufacturerFirebase.getManufacturers();
      this._manufacturers.set(manufacturers);
      this._manufacturersLoaded.set(true); // Mark as loaded
    } catch (error) {
      this._error.set('Failed to load manufacturers');
      console.error('Error loading manufacturers:', error);
    } finally {
      this._loading.set(false);
    }
  }

  // Create manufacturer
  async createManufacturer(manufacturer: Omit<DimManufacturer, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const id = await this.manufacturerFirebase.addManufacturer(manufacturer);
      // Optimistic update
      const newManufacturer: DimManufacturer = { ...manufacturer, id };
      this._manufacturers.update(manufacturers => [...manufacturers, newManufacturer]);
      this.toastService.success(`Manufacturer Created: ${manufacturer.name}`);
    } catch (error) {
      this._error.set('Failed to create manufacturer');
      console.error('Error creating manufacturer:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Update manufacturer
  async updateManufacturer(id: string, data: Partial<DimManufacturer>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      const currentManufacturers = this._manufacturers();
      const updatedManufacturers = currentManufacturers.map(m =>
        m.id === id ? { ...m, ...data } : m
      );
      this._manufacturers.set(updatedManufacturers);

      // Update in Firebase
      await this.manufacturerFirebase.updateManufacturer(id, data);
      this.toastService.success(`Manufacturer Updated: ${data.name}`);
    } catch (error) {
      this._error.set('Failed to update manufacturer');
      console.error('Error updating manufacturer:', error);
      // Reload manufacturers to revert optimistic update
      await this.loadManufacturers();
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Delete manufacturer
  async deleteManufacturer(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Optimistic update
      this._manufacturers.update(manufacturers => manufacturers.filter(m => m.id !== id));

      // Delete from Firebase
      await this.manufacturerFirebase.deleteManufacturer(id);
      this.toastService.success(`Manufacturer Deleted: ${id}`);
    } catch (error) {
      this._error.set('Failed to delete manufacturer');
      console.error('Error deleting manufacturer:', error);
      // Reload manufacturers to revert optimistic update
      await this.loadManufacturers();
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
