import { Component, signal, effect, input, output, viewChild, inject, computed } from '@angular/core';
import { DimSubCollection, createEmptySubCollection } from '../../../features/dimensions/dimensions.model';
import { FormComponents, FormInput } from '../../form/form';
import { ProductFormDualtextarea } from '../../product-form/product-form-dualtextarea/product-form-dualtextarea';
import { slugify } from '../../../utils/slug.utils';
import { DropdownCollections } from "../../dropdown-collections/dropdown-collections";
import { CollectionService } from '../../../features/dimensions/collection/collection.service';

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
  private collectionService = inject(CollectionService);
  // ViewChild for focus control
  private nameEsInput = viewChild<FormInput>('nameEsInput');

  // =============== INPUTS/OUTPUTS =========================

  // SubCollection Data received from parent
  subcollection = input<DimSubCollection>(createEmptySubCollection());
  // Loading state
  loading = input<boolean>(false);
  // Display reduced version of the form
  reduced = input<boolean>(false);
  // Event emitter for updated subcollectionData
  updatedSubCollection = output<DimSubCollection>();

  // =============== FORMFIELDS =========================

  name_en = signal<string>('');
  name_es = signal<string>('');
  text_en = signal<string>('');
  text_es = signal<string>('');
  slug = signal<string>('');
  isActive = signal<boolean>(true);
  order = signal<number | undefined>(undefined);
  collectionId =  computed(() => this.collectionService.selectedCollectionId());

  // =============== EFFECTS =========================

  constructor() {
    // Load subcollection data when subcollection changes
    effect(() => this.syncInputToFormFields());
    // Update subcollection model when form fields change
    effect(() => this.emitUpdatedSubCollection());
  }

  // Sync Input subcollection to form fields
  private syncInputToFormFields(): void {
    const sc = this.subcollection();
    this.name_en.set(sc.name?.en || '');
    this.name_es.set(sc.name?.es || '');
    this.text_en.set(sc.text?.en || '');
    this.text_es.set(sc.text?.es || '');
    this.slug.set(sc.slug || '');
    this.isActive.set(sc.isActive);
    this.order.set(sc.order);
    // Only sync if we have a real ID (edit mode)
    if (sc.id) {
      this.collectionService.setSelectedCollectionId(sc.collectionId || '');
    }
  }

  // Sync form fields to Output subcollection
  private emitUpdatedSubCollection(): void {
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
      // Add order if provided
      if (this.order() !== undefined) {
        subcollectionData.order = this.order();
      }
      // Add collectionId if provided
      if (this.collectionId()) {
        subcollectionData.collectionId = this.collectionId();
      }
      // Emit updated subcollection data
      this.updatedSubCollection.emit(subcollectionData);
  }

  // =============== ACTIONS =========================

  nameENBlur() {
    const englishName = this.name_en().trim();
    this.slug.set(slugify(englishName));
  }


  slugBlur() {
    this.slug.set(slugify(this.slug().trim()));
  }

  focusNameEs() {
    this.nameEsInput()?.focus();
  }
}
