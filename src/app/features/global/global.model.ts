/**
 * Type of draggable element
 */
export type DragType = 'images' | 'products';

/**
 * Data structure for drag operations
 */
export interface DragData {
  type: DragType;
  ids: string[];
}

/**
 * Folder drop event with timestamp
 */
export interface FolderDropEvent {
  folderId: string;
  timestamp: number;
}
