import { MultilingualString } from '../global/global.model';

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
