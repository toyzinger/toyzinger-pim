// Special folder IDs
export const SPECIAL_FOLDERS = {
  ROOT: 'root',
  UNASSIGNED: 'unassigned',
} as const;

export type ItemType = 'product' | 'image';

export interface Folder {
  id?: string;
  name: string;
  parentId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  isVirtual?: boolean; // For special folders like Root, Unassigned
}

export interface FolderItem {
  id?: string;
  folderId: string;
  itemId: string;
  itemType: ItemType;
  order: number;
  addedAt: Date;
}
