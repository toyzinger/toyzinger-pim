import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Franchise, Manufacturer } from './dimensions.model';

@Injectable({
  providedIn: 'root',
})
export class DimensionsService {
  private platformId = inject(PLATFORM_ID);

  // ========================================
  // STATE (Private signals)
  // ========================================

  private _franchises = signal<Franchise[]>([]);
  private _manufacturers = signal<Manufacturer[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  readonly franchises = this._franchises.asReadonly();
  readonly manufacturers = this._manufacturers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Load dimensions automatically on service initialization
  constructor() {
    // Only load in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllDimensions();
    }
  }

  // ========================================
  // ACTIONS
  // ========================================
  async loadFranchises(): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);

      const response = await fetch('/assets/data/dim_franchises.json');
      if (!response.ok) {
        throw new Error('Failed to load franchises');
      }

      const data: Franchise[] = await response.json();
      this._franchises.set(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this._error.set(message);
      console.error('Error loading franchises:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async loadManufacturers(): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);

      const response = await fetch('/assets/data/dim_manufacturer.json');
      if (!response.ok) {
        throw new Error('Failed to load manufacturers');
      }

      const data: Manufacturer[] = await response.json();
      this._manufacturers.set(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this._error.set(message);
      console.error('Error loading manufacturers:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async loadAllDimensions(): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);

      await Promise.all([
        this.loadFranchises(),
        this.loadManufacturers(),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this._error.set(message);
      console.error('Error loading dimensions:', error);
    } finally {
      this._loading.set(false);
    }
  }
}
