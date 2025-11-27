import { MultilingualStringArray, MultilingualString } from '../global/global.model';
import { ProductImage } from '../productimages/productimages.model';

export interface Product {
  id?: string;
  name: string;
  folderId?: string; // Optional folder assignment
  franchise?: MultilingualString;
  manufacturer?: MultilingualString;
  yearReleased?: number;
  collection?: string;
  size?: string;
  accessories?: MultilingualStringArray;
  toyDescription?: MultilingualString;
  characterDescription?: MultilingualString;
  images?: ProductImage[];
  //
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
    collection: '',
    isActive: true,
    sku: undefined,
    size: undefined,
    yearReleased: undefined,
    accessories: undefined,
    toyDescription: undefined,
    characterDescription: undefined,
    images: undefined,
    franchise: undefined,
    manufacturer: undefined,
  };
}