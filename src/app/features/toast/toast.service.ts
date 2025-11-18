import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from './toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // ========================================
  // STATE (Private signals)
  // ========================================

  private _toasts = signal<Toast[]>([]);
  private _removingToasts = signal<Set<string>>(new Set());

  // ========================================
  // SELECTORS (Public readonly)
  // ========================================

  readonly toasts = this._toasts.asReadonly();
  readonly removingToasts = this._removingToasts.asReadonly();

  // ========================================
  // ACTIONS
  // ========================================

  // Show a toast notification
  private show(message: string, type: ToastType = 'info', duration: number = 5000) {
    const id = this.generateId();
    const toast: Toast = { id, message, type, duration };

    // Add toast to array
    this._toasts.update(toasts => [...toasts, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  // Show a success toast
  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  // Show a warning toast
  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  // Show a danger/error toast
  danger(message: string, duration?: number) {
    this.show(message, 'danger', duration);
  }

  // Show an info toast
  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  // Remove a toast with animation
  remove(id: string) {
    // Add to removing set to trigger animation
    this._removingToasts.update(set => new Set(set).add(id));

    // Wait for animation to complete before actually removing
    setTimeout(() => {
      this._toasts.update(toasts => toasts.filter(t => t.id !== id));
      this._removingToasts.update(set => {
        const newSet = new Set(set);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Match animation duration
  }

  // Clear all toasts at once
  clear() {
    this._toasts.set([]);
  }

  // ========================================
  // HELPERS
  // ========================================

  // Generate a unique ID for each toast
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
