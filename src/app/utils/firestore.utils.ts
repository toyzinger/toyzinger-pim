import { deleteField } from '@angular/fire/firestore';

// Helper: Remove undefined values from object (Firebase doesn't support undefined)
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
}

// Helper: Replace undefined values with deleteField() for updates
export function prepareUpdateData<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === undefined) {
      acc[key] = deleteField();
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
}
