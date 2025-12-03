import { Component, signal, effect, input, output } from '@angular/core';
import { DimCollection, createEmptyCollection } from '../../../features/dimensions/dimensions.model';
import { FormComponents } from '../../form/form';
import { ProductFormDualtextarea } from '../../product-form/product-form-dualtextarea/product-form-dualtextarea';
import { slugify } from '../../../utils/slug.utils';
import { DropdownFranchises } from "../../dropdown-franchises/dropdown-franchises";
import { DropdownManufacturers } from "../../dropdown-manufacturers/dropdown-manufacturers";

@Component({
  selector: 'app-collection-form',
  imports: [
    FormComponents,
    ProductFormDualtextarea,
    DropdownFranchises,
    DropdownManufacturers
  ],
  templateUrl: './collection-form.html',
  styleUrl: './collection-form.scss',
})
export class CollectionForm {

  // Collection Data received from parent
  collection = input<DimCollection>(createEmptyCollection());
  // Loading state
  loading = input<boolean>(false);
  // Reduced version of the form
  reduced = input<boolean>(false);
  // Event emitter for updated collectionData
  updatedCollection = output<DimCollection>();

  // Form fields
  name_en = signal<string>('');
  name_es = signal<string>('');
  text_en = signal<string>('');
  text_es = signal<string>('');
  slug = signal<string>('');
  franchiseId = signal<string>('');
  manufacturerId = signal<string>('');
  imgJumbotronPath = signal<string>('');
  years = signal<string>('');
  isActive = signal<boolean>(true);
  order = signal<number | undefined>(undefined);

  constructor() {
    // Load collection data when collection changes
    effect(() => {
      this.loadCollectionData(this.collection());
    });
    // Update collection model when form fields change
    effect(() => {
      const collectionData: DimCollection = {
        name: {
          en: this.name_en(),
          es: this.name_es(),
        },
        isActive: this.isActive(),
      };
      // Add text if provided
      const textEn = this.text_en();
      const textEs = this.text_es();
      if (textEn || textEs) {
        collectionData.text = {
          en: textEn,
          es: textEs,
        };
      }
      // Add slug if provided
      if (this.slug().trim()) {
        collectionData.slug = this.slug().trim();
      }
      // Add franchiseId if provided
      if (this.franchiseId().trim()) {
        collectionData.franchiseId = this.franchiseId().trim();
      }
      // Add manufacturerId if provided
      if (this.manufacturerId().trim()) {
        collectionData.manufacturerId = this.manufacturerId().trim();
      }
      // Add image path if provided
      if (this.imgJumbotronPath().trim()) {
        collectionData.imgJumbotronPath = this.imgJumbotronPath().trim();
      }
      // Add years if provided
      if (this.years().trim()) {
        collectionData.years = this.years().trim();
      }
      // Add order if provided
      if (this.order() !== undefined) {
        collectionData.order = this.order();
      }
      // Emit updated collection data
      this.updatedCollection.emit(collectionData);
    });
  }

  nameENBlur() {
    const englishName = this.name_en().trim();
    this.slug.set(slugify(englishName));
  }


  slugBlur() {
    this.slug.set(slugify(this.slug().trim()));
  }

  private loadCollectionData(col: DimCollection): void {
    this.name_en.set(col.name?.en || '');
    this.name_es.set(col.name?.es || '');
    this.text_en.set(col.text?.en || '');
    this.text_es.set(col.text?.es || '');
    this.slug.set(col.slug || '');
    this.franchiseId.set(col.franchiseId || '');
    this.manufacturerId.set(col.manufacturerId || '');
    this.imgJumbotronPath.set(col.imgJumbotronPath || '');
    this.years.set(col.years || '');
    this.isActive.set(col.isActive);
    this.order.set(col.order);
  }
}
