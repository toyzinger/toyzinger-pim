import { Component, signal, effect, input, output, inject, computed } from '@angular/core';
import { Product, createEmptyProduct } from '../../features/products/products.model';
import { FormComponents } from '../form/form';
import { DropdownFranchises } from '../dropdown-franchises/dropdown-franchises';
import { DropdownCollections } from '../dropdown-collections/dropdown-collections';
import { DropdownSubCollections } from '../dropdown-subcollections/dropdown-subcollections';
import { DropdownManufacturers } from '../dropdown-manufacturers/dropdown-manufacturers';
import { ProductFormDualtextarea } from './product-form-dualtextarea/product-form-dualtextarea';
import { ProductFormAccessories } from './product-form-accessories/product-form-accessories';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';

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
  private franchiseService = inject(FranchiseService);
  private collectionService = inject(CollectionService);
  private manufacturerService = inject(ManufacturerService);
  private subCollectionService = inject(SubCollectionService);

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
  toyDescription_es = signal<string>('');
  toyDescription_en = signal<string>('');
  characterDescription_es = signal<string>('');
  characterDescription_en = signal<string>('');
  accessories = signal<{ en: string[]; es: string[] }>({ en: [], es: [] });
  // values from DIM dropdowns
  franchiseId = computed(() => this.franchiseService.selectedFranchiseId());
  collectionId = computed(() => this.collectionService.selectedCollectionId());
  manufacturerId = computed(() => this.manufacturerService.selectedManufacturerId());
  subCollectionId = computed(() => this.subCollectionService.selectedSubCollectionId());

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
    // set DIM Dropdowns only if we have a real ID (edit mode)
    if (prod.id) {
      this.franchiseService.setSelectedFranchiseId(prod.franchiseId || '');
      this.collectionService.setSelectedCollectionId(prod.collectionId || '');
      this.manufacturerService.setSelectedManufacturerId(prod.manufacturerId || '');
      this.subCollectionService.setSelectedSubCollectionId(prod.subCollectionId || '');
    }
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

    // Get Dimension values from Services
    productData.franchiseId = this.franchiseService.selectedFranchiseId() || undefined;
    productData.collectionId = this.collectionService.selectedCollectionId() || undefined;
    productData.manufacturerId = this.manufacturerService.selectedManufacturerId() || undefined;
    productData.subCollectionId = this.subCollectionService.selectedSubCollectionId() || undefined;

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
  }
}
