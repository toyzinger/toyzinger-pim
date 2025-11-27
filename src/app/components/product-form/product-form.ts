import { Component, model, signal, effect, untracked, input, OnInit, output } from '@angular/core';
import { Product, createEmptyProduct } from '../../features/products/products.model';
import { MultilingualString } from '../../features/global/global.model';
import { FormComponents } from '../form/form';
import { ProductFormFranchise } from "./product-form-franchise/product-form-franchise";
import { ProductFormManufacturer } from "./product-form-manufacturer/product-form-manufacturer";
import { ProductFormDualtextarea } from './product-form-dualtextarea/product-form-dualtextarea';
import { ProductFormAccessories } from './product-form-accessories/product-form-accessories';

@Component({
  selector: 'app-product-form',
  imports: [FormComponents, ProductFormFranchise, ProductFormManufacturer, ProductFormDualtextarea, ProductFormAccessories],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {

  // Product Data received from parent
  product = input<Product>(createEmptyProduct());
  // Loading state
  loading = input<boolean>(false);

  // Event emitter for updated productData
  updatedProduct = output<Product>();

  // Product Data to be sent to parent
  productData = signal<Product>(createEmptyProduct());
  // Form fields
  name = signal<string>('');
  collection = signal<string>('');
  sku = signal<string>('');
  size = signal<string>('');
  yearReleased = signal<number | undefined>(undefined);
  isActive = signal<boolean>(true);
  franchise = signal<MultilingualString | undefined>(undefined);
  manufacturer = signal<MultilingualString | undefined>(undefined);
  toyDescription_es = signal<string>('');
  toyDescription_en = signal<string>('');
  characterDescription_es = signal<string>('');
  characterDescription_en = signal<string>('');
  accessories = signal<{ en: string[]; es: string[] }>({ en: [], es: [] });

  constructor() {
    // Load product data when product changes
    effect(() => {
      this.loadProductData(this.product());
    });
    // Update product model when form fields change
    effect(() => {
      const productData: Product = {
        name: this.name(),
        collection: this.collection(),
        sku: this.sku().trim() || undefined,
        size: this.size().trim() || undefined,
        yearReleased: this.yearReleased(),
        isActive: this.isActive(),
      };
      // Add franchise if provided
      if (this.franchise()) {
        productData.franchise = this.franchise();
      }
      // Add manufacturer if provided
      if (this.manufacturer()) {
        productData.manufacturer = this.manufacturer();
      }
      // Add toy description if provided
      const toyDescEn = this.toyDescription_en().trim();
      const toyDescEs = this.toyDescription_es().trim();
      if (toyDescEn || toyDescEs) {
        productData.toyDescription = {
          en: toyDescEn,
          es: toyDescEs,
        };
      }
      // Add character description if provided
      const charDescEn = this.characterDescription_en().trim();
      const charDescEs = this.characterDescription_es().trim();
      if (charDescEn || charDescEs) {
        productData.characterDescription = {
          en: charDescEn,
          es: charDescEs,
        };
      }
      // Add accessories if provided
      const acc = this.accessories();
      if (acc.en.length > 0 || acc.es.length > 0) {
        productData.accessories = acc;
      }
      // Emit updated product data
      this.updatedProduct.emit(productData);
    });
  }

  private loadProductData(prod: Product | Omit<Product, 'id'>): void {
    this.name.set(prod.name || '');
    this.collection.set(prod.collection || '');
    this.sku.set(prod.sku || '');
    this.size.set(prod.size || '');
    this.yearReleased.set(prod.yearReleased);
    this.isActive.set(prod.isActive);

    // Load multilingual fields
    this.franchise.set(prod.franchise);
    this.manufacturer.set(prod.manufacturer);
    if (prod.toyDescription) {
      this.toyDescription_en.set(prod.toyDescription.en || '');
      this.toyDescription_es.set(prod.toyDescription.es || '');
    } else {
      this.toyDescription_en.set('');
      this.toyDescription_es.set('');
    }
    if (prod.characterDescription) {
      this.characterDescription_en.set(prod.characterDescription.en || '');
      this.characterDescription_es.set(prod.characterDescription.es || '');
    } else {
      this.characterDescription_en.set('');
      this.characterDescription_es.set('');
    }
    if (prod.accessories) {
      this.accessories.set({
        en: prod.accessories.en || [],
        es: prod.accessories.es || [],
      });
    } else {
      this.accessories.set({ en: [], es: [] });
    }
  }
}
