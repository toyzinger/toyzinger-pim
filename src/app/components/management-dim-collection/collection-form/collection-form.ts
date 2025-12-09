import { Component, signal, effect, input, output, viewChild, inject, computed } from '@angular/core';
import { DimCollection, createEmptyCollection } from '../../../features/dimensions/dimensions.model';
import { FormComponents, FormInput } from '../../form/form';
import { ProductFormDualtextarea } from '../../product-form/product-form-dualtextarea/product-form-dualtextarea';
import { slugify } from '../../../utils/slug.utils';
import { DropdownFranchises } from "../../dropdown-franchises/dropdown-franchises";
import { DropdownManufacturers } from "../../dropdown-manufacturers/dropdown-manufacturers";
import { FranchiseService } from '../../../features/dimensions/franchise/franchise.service';
import { ManufacturerService } from '../../../features/dimensions/manufacturer/manufacturer.service';

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
  private franchiseService = inject(FranchiseService);
  private manufacturerService = inject(ManufacturerService);
  // ViewChild for focus control
  private nameEsInput = viewChild<FormInput>('nameEsInput');

  // ============ INPUTS ==================

  // Collection Data received from parent
  collection = input<DimCollection>(createEmptyCollection());
  // Loading state
  loading = input<boolean>(false);
  // Display reduced version of the form
  reduced = input<boolean>(false);

  // ============ OUTPUTS ==================

  // Event emitter for updated collectionData
  updatedCollection = output<DimCollection>();

  // ============ SIGNALS ==================

  // Form fields
  name_en = signal<string>('');
  name_es = signal<string>('');
  text_en = signal<string>('');
  text_es = signal<string>('');
  slug = signal<string>('');
  imgJumbotronPath = signal<string>('');
  years = signal<string>('');
  isActive = signal<boolean>(true);
  order = signal<number | undefined>(undefined);
  // Values from Dim Dropdowns
  franchiseId =  computed(() => this.franchiseService.selectedFranchiseId());
  manufacturerId = computed(() => this.manufacturerService.selectedManufacturerId());

  // ============ EFFECTS ==================

  constructor() {
    effect(() => this.syncInputToFormFields());
    effect(() => this.emitUpdatedCollection());
  }

  // Sync Input collection to form fields
  private syncInputToFormFields(): void {
    // Track collection changes
    const col = this.collection();
    // sync form fields with collection
    this.name_en.set(col.name?.en || '');
    this.name_es.set(col.name?.es || '');
    this.text_en.set(col.text?.en || '');
    this.text_es.set(col.text?.es || '');
    this.slug.set(col.slug || '');
    this.imgJumbotronPath.set(col.imgJumbotronPath || '');
    this.years.set(col.years || '');
    this.isActive.set(col.isActive);
    this.order.set(col.order);
    // Only sync if we have a real ID (edit mode)
    if (col.id) {
      this.franchiseService.setSelectedFranchiseId(col.franchiseId || '');
      this.manufacturerService.setSelectedManufacturerId(col.manufacturerId || '');
    }
  }

  // Sync form fields to Output collection (debounced manual emission/trigger)
  private emitUpdatedCollection(): void {
    // Create collection data object
    const collectionData: DimCollection = createEmptyCollection();
    collectionData.name = {
      en: this.name_en(),
      es: this.name_es(),
    };
    collectionData.isActive = this.isActive();
    // Add text if provided
    const textEn = this.text_en();
    const textEs = this.text_es();
    if (textEn || textEs) {
      collectionData.text = { en: textEn, es: textEs };
    }
    // Add optional fields if provided
    if (this.slug().trim()) collectionData.slug = this.slug().trim();
    if (this.imgJumbotronPath().trim()) collectionData.imgJumbotronPath = this.imgJumbotronPath().trim();
    if (this.years().trim()) collectionData.years = this.years().trim();
    if (this.order() !== undefined) collectionData.order = this.order();
    // Values from Dim Dropdowns
    if (this.franchiseId()) collectionData.franchiseId = this.franchiseId() || undefined;
    if (this.manufacturerId()) collectionData.manufacturerId = this.manufacturerId() || undefined;
    // Emit updated collection data
    this.updatedCollection.emit(collectionData);
  }

  // ============ METHODS ==================

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
