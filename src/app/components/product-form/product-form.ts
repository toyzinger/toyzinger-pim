import { Component, signal, effect, input, output } from '@angular/core';
import { Product, createEmptyProduct } from '../../features/products/products.model';
import { FormComponents } from '../form/form';
import { DropdownFranchises } from '../dropdown-franchises/dropdown-franchises';
import { DropdownCollections } from '../dropdown-collections/dropdown-collections';
import { DropdownSubCollections } from '../dropdown-subcollections/dropdown-subcollections';
import { DropdownManufacturers } from '../dropdown-manufacturers/dropdown-manufacturers';
import { ProductFormDualtextarea } from './product-form-dualtextarea/product-form-dualtextarea';
import { ProductFormAccessories } from './product-form-accessories/product-form-accessories';

@Component({
  selector: 'app-product-form',
  imports: [
    FormComponents,
    DropdownFranchises,
    DropdownCollections,
    DropdownSubCollections,
    DropdownManufacturers,
    ProductFormDualtextarea,
    ProductFormAccessories
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {

  // =============== INPUTS =========================

  product = input<Product>(createEmptyProduct()); // Product Data received from parent
  loading = input<boolean>(false);  // Loading state

  // =============== OUTPUTS =========================

  updatedProduct = output<Product>(); // Event emitter for updated productData

  // =============== SIGNALS =========================

  productData = signal<Product>(createEmptyProduct()); // Product Data to be sent to parent
  // Form fields
  name = signal<string>('');
  sku = signal<string>('');
  size = signal<string>('');
  yearReleased = signal<number | undefined>(undefined);
  isActive = signal<boolean>(true);
  franchiseId = signal<string>('');
  collectionId = signal<string>('');
  subCollectionId = signal<string>('');
  manufacturerId = signal<string>('');
  toyDescription_es = signal<string>('');
  toyDescription_en = signal<string>('');
  characterDescription_es = signal<string>('');
  characterDescription_en = signal<string>('');
  accessories = signal<{ en: string[]; es: string[] }>({ en: [], es: [] });

  // =============== EFFECTS =========================

  constructor() {
    effect(() => this.syncProductInputToFormFields());
    effect(() => this.syncFormFieldsToProductOutput());
  }

  // INPUT = Sync product input to form fields when product changes
  private syncProductInputToFormFields(): void {
    const prod = this.product();
    // set Form fields
    this.name.set(prod.name || '');
    this.sku.set(prod.sku || '');
    this.size.set(prod.size || '');
    this.yearReleased.set(prod.yearReleased);
    this.isActive.set(prod.isActive);
    // set ID fields
    this.franchiseId.set(prod.franchiseId || '');
    this.collectionId.set(prod.collectionId || '');
    this.subCollectionId.set(prod.subCollectionId || '');
    this.manufacturerId.set(prod.manufacturerId || '');
    // set multilingual fields
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

  // OUTPUT = Sync form fields to output product when any field changes
  private syncFormFieldsToProductOutput(): void {
    const productData: Product = createEmptyProduct()

    productData.name = this.name();
    productData.isActive = this.isActive();

    productData.sku = this.sku().trim() || undefined;
    productData.size = this.size().trim() || undefined;
    productData.yearReleased = this.yearReleased() || undefined;
    productData.franchiseId = this.franchiseId() || undefined;
    productData.collectionId = this.collectionId() || undefined;
    productData.subCollectionId = this.subCollectionId() || undefined;
    productData.manufacturerId = this.manufacturerId() || undefined;

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
    // console.log('Product Data:', productData);
    this.updatedProduct.emit(productData);
  }
}
