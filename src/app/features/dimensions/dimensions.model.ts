import { createEmptyMultilingualString, MultilingualString } from '../global/global.model';

// ====================
// OLD - TODO DELETE
// ====================

// Base interface for all dimensions
export interface DimensionBase {
  id: number | string;
  label: MultilingualString;
}

export interface Franchise extends DimensionBase {
  // Franchise specific fields if any
}

export interface Manufacturer extends DimensionBase {
  // Manufacturer specific fields if any
}

// Type for all dimensions collections
export interface DimensionsData {
  franchises: Franchise[];
  manufacturers: Manufacturer[];
}

// ====================
// NEW - TODO KEEP
// ====================

export type dimensionType = 'franchise' | 'collection' | 'subcollection' | 'manufacturer';

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
