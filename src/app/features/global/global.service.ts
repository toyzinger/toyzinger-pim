import { Injectable, signal } from '@angular/core';
import { DragData, FolderDropEvent, ItemType } from './global.model';

/**
 * Global service for cross-component communication and shared state
 * Handles drag-and-drop coordination and other global app-wide features
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  // ========================================
  // APP STATE
  // ========================================

  // Current item type context (product or image)
  private _itemType = signal<ItemType | null>(null);

  // Current item type as readonly signal
  itemType = this._itemType.asReadonly();

  // Set the current item type
  setItemType(type: ItemType): void {
    this._itemType.set(type);
  }

  // ========================================
  // DRAG AND DROP ON FOLDERS FUNCTIONALITY
  // ========================================

  //Current drag data (what's being dragged)
  private _dragData = signal<DragData | null>(null);
  //Latest folder drop event
  private _folderDrop = signal<FolderDropEvent | null>(null);

  //Current drag data as readonly signal
  dragData = this._dragData.asReadonly();
  //Latest folder drop event as readonly signal
  folderDrop = this._folderDrop.asReadonly();


  //Set drag data when drag operation starts
  setDragData(data: DragData): void {
    this._dragData.set(data);
  }
  //Clear drag data when drag operation ends
  clearDragData(): void {
    this._dragData.set(null);
  }
  //Notify that a folder drop occurred
  notifyFolderDrop(folderId: string): void {
    this._folderDrop.set({
      folderId,
      timestamp: Date.now(),
    });
  }
  //Clear folder drop event (optional cleanup)
  clearFolderDrop(): void {
    this._folderDrop.set(null);
  }

  /**
   * Create a custom drag preview element
   * @param event - The drag event
   * @param count - Number of items being dragged
   * @param icon - Material icon name (default: 'collections')
   * @param itemLabel - Label for the items (default: 'item')
   */
  createDragPreview(
    event: DragEvent,
    count: number,
    icon: string = 'collections',
    itemLabel: string = 'item'
  ): void {
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: linear-gradient(135deg, #DC8F02 0%, #FF8C00 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10000;
      pointer-events: none;
    `;

    dragImage.innerHTML = `
      <span class="material-icons-outlined" style="font-size: 20px;">${icon}</span>
      <span>Moving ${count} ${itemLabel}${count > 1 ? 's' : ''}</span>
    `;

    document.body.appendChild(dragImage);

    // Set as drag image (offset from cursor)
    event.dataTransfer?.setDragImage(dragImage, 60, 30);

    // Remove after drag starts
    setTimeout(() => dragImage.remove(), 0);
  }
}
