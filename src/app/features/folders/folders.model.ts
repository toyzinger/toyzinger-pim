import { ItemType } from '../global/global.model';

// Special folder IDs
export const SPECIAL_FOLDERS = {
  ROOT: 'root',
  UNASSIGNED: 'unassigned',
} as const;

export interface Folder {
  id?: string;
  name: string;
  parentId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  isVirtual?: boolean; // For special folders like Root, Unassigned
}


