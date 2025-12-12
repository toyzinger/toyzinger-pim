import { Injectable } from '@angular/core';

/**
 * Global service for cross-component communication and shared state
 * Handles global app-wide features like drag preview and localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalService {


  /**
   * Save a value to localStorage
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON stringified)
   */
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

  /**
   * Get a value from localStorage
   * @param key - The key to retrieve
   * @param defaultValue - Default value if key doesn't exist
   * @returns The stored value or the default value
   */
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

  /**
   * Remove a value from localStorage
   * @param key - The key to remove
   */
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

  /**
   * Clear all localStorage
   */
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
