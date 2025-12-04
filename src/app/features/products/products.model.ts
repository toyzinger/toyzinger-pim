import { MultilingualStringArray, MultilingualString } from '../global/global.model';
import { ProductImage } from '../productimages/productimages.model';

export interface Product {
  id?: string;
  name: string;
  folderId?: string; // Optional folder assignment
  franchiseId?: string; // Reference to franchise dimension
  collectionId?: string; // Reference to collection dimension
  subCollectionId?: string; // Reference to subcollection dimension
  manufacturerId?: string; // Reference to manufacturer dimension
  yearReleased?: number;
  size?: string;
  accessories?: MultilingualStringArray;
  toyDescription?: MultilingualString;
  characterDescription?: MultilingualString;
  images?: ProductImage[];
  slug?: string;
  // Not used
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  sku?: string;
}

/**
 * Factory function to create an empty product with default values.
 * Use this when creating new products or resetting form state.
 *
 * @returns A new product object without an ID, ready to be populated
 */
export function createEmptyProduct(): Omit<Product, 'id'> {
  return {
    name: '',
    isActive: true,
    // Optional ID references
    folderId: undefined,
    franchiseId: undefined,
    collectionId: undefined,
    subCollectionId: undefined,
    manufacturerId: undefined,
    // Optional fields
    sku: undefined,
    size: undefined,
    yearReleased: undefined,
    accessories: undefined,
    toyDescription: undefined,
    characterDescription: undefined,
    images: undefined,
  };
}