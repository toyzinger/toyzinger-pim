export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}
