import { Component, signal, effect, input, output } from '@angular/core';
import { DimSubCollection, createEmptySubCollection } from '../../../features/dimensions/dimensions.model';
import { FormComponents } from '../../form/form';
import { ProductFormDualtextarea } from '../../product-form/product-form-dualtextarea/product-form-dualtextarea';
import { slugify } from '../../../utils/slug.utils';
import { DropdownCollections } from "../../dropdown-collections/dropdown-collections";

@Component({
  selector: 'app-subcollection-form',
  imports: [
    FormComponents,
    ProductFormDualtextarea,
    DropdownCollections
  ],
  templateUrl: './subcollection-form.html',
  styleUrl: './subcollection-form.scss',
})
export class SubCollectionForm {

  // SubCollection Data received from parent
  subcollection = input<DimSubCollection>(createEmptySubCollection());
  // Loading state
  loading = input<boolean>(false);
  // Display reduced version of the form
  reduced = input<boolean>(false);
  // Franchise ID received from parent to filter collections Dropdown
  franchiseId = input<string>('');
  // Event emitter for updated subcollectionData
  updatedSubCollection = output<DimSubCollection>();

  // Form fields
  name_en = signal<string>('');
  name_es = signal<string>('');
  text_en = signal<string>('');
  text_es = signal<string>('');
  slug = signal<string>('');
  collectionId = signal<string>('');
  isActive = signal<boolean>(true);
  order = signal<number | undefined>(undefined);

  constructor() {
    // Load subcollection data when subcollection changes
    effect(() => {
      this.loadSubCollectionData(this.subcollection());
    });
    // Update subcollection model when form fields change
    effect(() => {
      const subcollectionData: DimSubCollection = {
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
        subcollectionData.text = {
          en: textEn,
          es: textEs,
        };
      }
      // Add slug if provided
      if (this.slug().trim()) {
        subcollectionData.slug = this.slug().trim();
      }
      // Add collectionId if provided
      if (this.collectionId().trim()) {
        subcollectionData.collectionId = this.collectionId().trim();
      }
      // Add order if provided
      if (this.order() !== undefined) {
        subcollectionData.order = this.order();
      }
      // Emit updated subcollection data
      this.updatedSubCollection.emit(subcollectionData);
    });
  }

  nameENBlur() {
    const englishName = this.name_en().trim();
    this.slug.set(slugify(englishName));
  }


  slugBlur() {
    this.slug.set(slugify(this.slug().trim()));
  }

  private loadSubCollectionData(sc: DimSubCollection): void {
    this.name_en.set(sc.name?.en || '');
    this.name_es.set(sc.name?.es || '');
    this.text_en.set(sc.text?.en || '');
    this.text_es.set(sc.text?.es || '');
    this.slug.set(sc.slug || '');
    this.collectionId.set(sc.collectionId || '');
    this.isActive.set(sc.isActive);
    this.order.set(sc.order);
  }
}
