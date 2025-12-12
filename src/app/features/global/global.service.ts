import { Injectable, signal } from '@angular/core';

/**
 * Global service for cross-component communication and shared state
 * Handles global app-wide features like drag preview and localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalService {

  // ======================================================
  //  LOADING STATE MANAGEMENT
  // ======================================================

  private _loading = signal(false);
  loading = this._loading.asReadonly();
  private loadingDeactivationTimeout: ReturnType<typeof setTimeout> | null = null;

  activateLoading(): void {
    // Cancel any pending deactivation
    if (this.loadingDeactivationTimeout !== null) {
      clearTimeout(this.loadingDeactivationTimeout);
      this.loadingDeactivationTimeout = null;
    }
    this._loading.set(true);
  }

  deactivateLoading(): void {
    // Cancel any existing deactivation timeout
    if (this.loadingDeactivationTimeout !== null) {
      clearTimeout(this.loadingDeactivationTimeout);
    }

    // Schedule deactivation after 200ms
    this.loadingDeactivationTimeout = setTimeout(() => {
      this._loading.set(false);
      this.loadingDeactivationTimeout = null;
    }, 200);
  }

  // ======================================================
  //  LOCAL STORAGE UTILITIES
  // ======================================================

  setLocalStorage<T>(key: string, value: T): void {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getLocalStorage<T>(key: string, defaultValue: T): T {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return defaultValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  removeLocalStorage(key: string): void {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clearLocalStorage(): void {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
