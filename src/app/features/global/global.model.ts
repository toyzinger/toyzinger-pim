/**
 * Type of draggable element and item context
 */
export type ItemType = 'images' | 'products';

/**
 * Data structure for drag operations
 */
export interface DragData {
  type: ItemType;
  ids: string[];
}

/**
 * Folder drop event with timestamp
 */
export interface FolderDropEvent {
  folderId: string;
  timestamp: number;
}

// Language type
export type Language = 'en' | 'es';

// Multilingual string using Language type
export type MultilingualString = Record<Language, string>;

// Multilingual array of strings using Language type
export type MultilingualStringArray = Record<Language, string[]>;
