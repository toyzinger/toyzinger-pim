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