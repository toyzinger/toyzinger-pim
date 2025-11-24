import { MultilingualStringArray, MultilingualString } from '../languages/languages.model';
import { ProductImage } from '../productimages/productimages.model';

export interface Product {
  id?: string;
  name: string;
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