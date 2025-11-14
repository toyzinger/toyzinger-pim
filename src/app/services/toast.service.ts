import { Injectable, signal } from '@angular/core';

type ToastType = 'success' | 'warning' | 'danger' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private removingToasts = signal<Set<string>>(new Set());

  // Expose toasts as readonly
  readonly toasts$ = this.toasts.asReadonly();
  readonly removingToasts$ = this.removingToasts.asReadonly();

  // Show a toast notification
  private show(message: string, type: ToastType = 'info', duration: number = 5000) {
    const id = this.generateId();
    const toast: Toast = { id, message, type, duration };

    // Add toast to array
    this.toasts.update(toasts => [...toasts, toast]);

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
    this.removingToasts.update(set => new Set(set).add(id));

    // Wait for animation to complete before actually removing
    setTimeout(() => {
      this.toasts.update(toasts => toasts.filter(t => t.id !== id));
      this.removingToasts.update(set => {
        const newSet = new Set(set);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Match animation duration
  }

  // Clear all toasts at once
  clear() {
    this.toasts.set([]);
  }

  // Generate a unique ID for each toast
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
