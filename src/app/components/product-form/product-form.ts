import { Component, input, output, signal, effect } from '@angular/core';
import { Product } from '../../features/products/products.model';
import { MultilingualString } from '../../features/languages/languages.model';
import { FormComponents } from '../form/form';
import { ProductFormFranchise } from "./product-form-franchise/product-form-franchise";
import { ProductFormManufacturer } from "./product-form-manufacturer/product-form-manufacturer";
import { ProductFormDualtextarea } from './product-form-dualtextarea/product-form-dualtextarea';

@Component({
  selector: 'app-product-form',
  imports: [FormComponents, ProductFormFranchise, ProductFormManufacturer, ProductFormDualtextarea],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  product = input<Product | null>(null);
  loading = input<boolean>(false);

  submitProduct = output<Partial<Product>>();
  cancel = output<void>();

  // Form fields
  name = signal<string>('');
  collection = signal<string>('');
  sku = signal<string>('');
  size = signal<string>('');
  yearReleased = signal<number | undefined>(undefined);
  isActive = signal<boolean>(true);

  // Multilingual fields
  franchise = signal<MultilingualString | undefined>(undefined);
  manufacturer = signal<MultilingualString | undefined>(undefined);

  // Multilingual fields (English)
  toyDescription_en = signal<string>('');
  characterDescription_en = signal<string>('');

  // Multilingual fields (Spanish)
  toyDescription_es = signal<string>('');
  characterDescription_es = signal<string>('');

  // Accessories (English)
  accessories_en = signal<string>('');

  // Accessories (Spanish)
  accessories_es = signal<string>('');

  constructor() {
    // Load product data when product changes
    effect(() => {
      const prod = this.product();
      if (prod) {
        this.loadProductData(prod);
      } else {
        this.resetForm();
      }
    });
  }

  private loadProductData(prod: Product): void {
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
    }
    if (prod.characterDescription) {
      this.characterDescription_en.set(prod.characterDescription.en || '');
      this.characterDescription_es.set(prod.characterDescription.es || '');
    }
    if (prod.accessories) {
      this.accessories_en.set(prod.accessories.en?.join('\n') || '');
      this.accessories_es.set(prod.accessories.es?.join('\n') || '');
    }
  }

  onSubmit(): void {
    if (!this.name().trim() || this.loading()) {
      return;
    }

    const productData: Partial<Product> = {
      name: this.name().trim(),
      collection: this.collection().trim(),
      sku: this.sku().trim() || undefined,
      size: this.size().trim() || undefined,
      yearReleased: this.yearReleased(),
      isActive: this.isActive(),
    };

    // Add multilingual fields if provided
    if (this.franchise()) {
      productData.franchise = this.franchise();
    }

    if (this.manufacturer()) {
      productData.manufacturer = this.manufacturer();
    }

    const toyDescEn = this.toyDescription_en().trim();
    const toyDescEs = this.toyDescription_es().trim();
    if (toyDescEn || toyDescEs) {
      productData.toyDescription = {
        en: toyDescEn,
        es: toyDescEs,
      };
    }

    const charDescEn = this.characterDescription_en().trim();
    const charDescEs = this.characterDescription_es().trim();
    if (charDescEn || charDescEs) {
      productData.characterDescription = {
        en: charDescEn,
        es: charDescEs,
      };
    }

    // Parse accessories (newline separated)
    const accEn = this.accessories_en().trim();
    const accEs = this.accessories_es().trim();
    if (accEn || accEs) {
      productData.accessories = {
        en: accEn ? accEn.split('\n').map(a => a.trim()).filter(a => a) : [],
        es: accEs ? accEs.split('\n').map(a => a.trim()).filter(a => a) : [],
      };
    }

    this.submitProduct.emit(productData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetForm(): void {
    this.name.set('');
    this.collection.set('');
    this.sku.set('');
    this.size.set('');
    this.yearReleased.set(undefined);
    this.isActive.set(true);
    this.franchise.set(undefined);
    this.manufacturer.set(undefined);
    this.toyDescription_en.set('');
    this.toyDescription_es.set('');
    this.characterDescription_en.set('');
    this.characterDescription_es.set('');
    this.accessories_en.set('');
    this.accessories_es.set('');
  }
}
