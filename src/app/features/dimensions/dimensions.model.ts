import { createEmptyMultilingualString, MultilingualString } from '../global/global.model';

export type dimensionType = 'franchise' | 'collection' | 'subcollection' | 'manufacturer' | 'size';

export interface DimFranchise {
  id?: string;
  name: MultilingualString;
  text?: MultilingualString;
  slug?: string;
  imgLogoPath?: string;
  imgJumbotronPath?: string;
  isActive: boolean;
  order?: number;
}

export interface DimCollection {
  id?: string;
  name: MultilingualString;
  text?: MultilingualString;
  franchiseId?: string;
  manufacturerId?: string;
  imgJumbotronPath?: string;
  years?: string;
  slug?: string;
  isActive: boolean;
  order?: number;
}

export interface DimSubCollection  {
  id?: string;
  name: MultilingualString;
  text?: MultilingualString;
  collectionId?: string;
  slug?: string;
  isActive: boolean;
  order?: number;
}

export interface DimManufacturer {
  id?: string;
  name: string;
  slug?: string;
  order?: number;
}

export interface DimSize {
  id?: string;
  text: string;
  slug?: string;
  order?: number;
}


// ====================
// Factory functions to create an empty dimension with default values.
// Use this when creating new dimensions or resetting form state.
// ====================

export function createEmptyFranchise(): Omit<DimFranchise, 'id'> {
  return {
    name: createEmptyMultilingualString(),
    text: createEmptyMultilingualString(),
    slug: '',
    imgLogoPath: '',
    imgJumbotronPath: '',
    isActive: true,
    order: undefined,
  };
}

export function createEmptyCollection(): Omit<DimCollection, 'id'> {
  return {
    name: createEmptyMultilingualString(),
    text: createEmptyMultilingualString(),
    franchiseId: '',
    manufacturerId: '',
    imgJumbotronPath: '',
    years: '',
    slug: '',
    isActive: true,
    order: undefined,
  };
}

export function createEmptySubCollection(): Omit<DimSubCollection, 'id'> {
  return {
    name: createEmptyMultilingualString(),
    text: createEmptyMultilingualString(),
    collectionId: '',
    slug: '',
    isActive: true,
    order: undefined,
  };
}

export function createEmptyManufacturer(): Omit<DimManufacturer, 'id'> {
  return {
    name: '',
    slug: '',
    order: undefined,
  };
}

export function createEmptySize(): Omit<DimSize, 'id'> {
  return {
    text: '',
    slug: '',
    order: undefined,
  };
}

// ====================
// Dimension Tree Node (for hierarchical navigation)
// ====================

// Node types for the dimensions tree
export type DimensionNodeType = 'special' | 'franchise' | 'collection' | 'subcollection';

// Unified tree node structure
export interface DimensionNode {
  id: string;
  name: string;
  type: DimensionNodeType;
  parentId?: string;
  isDroppable: boolean;
  years?: string; // For collections
}

// Special folder IDs for dimension navigation
export const SPECIAL_DIM_FOLDERS = {
  UNASSIGNED: '__dim_unassigned__',
  ALL: '__dim_all__',
};

// ====================
// Drag and Drop for Dimension Nodes
// ====================

/**
 * Data structure for drag operations
 */
export interface DragData {
  type: 'images' | 'products'
  ids: string[];
}

/**
 * Folder drop event with timestamp
 */
export interface FolderDropEvent {
  folderId: string;
  timestamp: number;
}
