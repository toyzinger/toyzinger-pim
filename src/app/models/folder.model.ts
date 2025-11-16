export interface Folder {
  id?: string;
  name: string;
  parentId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemType = 'product' | 'image';

export interface FolderItem {
  id?: string;
  folderId: string;
  itemId: string;
  itemType: ItemType;
  order: number;
  addedAt: Date;
}
