import { Component, signal, effect, input, output } from '@angular/core';
import { DimFranchise, createEmptyFranchise } from '../../features/dimensions/dimensions.model';
import { FormComponents } from '../form/form';
import { ProductFormDualtextarea } from '../product-form/product-form-dualtextarea/product-form-dualtextarea';
import { slugify } from '../../utils/slug.utils';

@Component({
  selector: 'app-franchise-form',
  imports: [FormComponents, ProductFormDualtextarea],
  templateUrl: './franchise-form.html',
  styleUrl: './franchise-form.scss',
})
export class FranchiseForm {

  // Franchise Data received from parent
  franchise = input<DimFranchise>(createEmptyFranchise());
  // Loading state
  loading = input<boolean>(false);
  // Reduced version of the form
  reduced = input<boolean>(false);
  // Event emitter for updated franchiseData
  updatedFranchise = output<DimFranchise>();

  // Form fields
  name_en = signal<string>('');
  name_es = signal<string>('');
  text_en = signal<string>('');
  text_es = signal<string>('');
  slug = signal<string>('');
  imgLogoPath = signal<string>('');
  imgJumbotronPath = signal<string>('');
  isActive = signal<boolean>(true);
  order = signal<number | undefined>(undefined);

  constructor() {
    // Load franchise data when franchise changes
    effect(() => {
      this.loadFranchiseData(this.franchise());
    });
    // Update franchise model when form fields change
    effect(() => {
      const franchiseData: DimFranchise = {
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
        franchiseData.text = {
          en: textEn,
          es: textEs,
        };
      }
      // Add slug if provided
      if (this.slug().trim()) {
        franchiseData.slug = this.slug().trim();
      }
      // Add image paths if provided
      if (this.imgLogoPath().trim()) {
        franchiseData.imgLogoPath = this.imgLogoPath().trim();
      }
      if (this.imgJumbotronPath().trim()) {
        franchiseData.imgJumbotronPath = this.imgJumbotronPath().trim();
      }
      // Add order if provided
      if (this.order() !== undefined) {
        franchiseData.order = this.order();
      }
      // Emit updated franchise data
      this.updatedFranchise.emit(franchiseData);
    });
  }

  nameENBlur() {
    const englishName = this.name_en().trim();
    this.slug.set(slugify(englishName));
  }


  slugBlur() {
    this.slug.set(slugify(this.slug().trim()));
  }

  private loadFranchiseData(fran: DimFranchise): void {
    this.name_en.set(fran.name?.en || '');
    this.name_es.set(fran.name?.es || '');
    this.text_en.set(fran.text?.en || '');
    this.text_es.set(fran.text?.es || '');
    this.slug.set(fran.slug || '');
    this.imgLogoPath.set(fran.imgLogoPath || '');
    this.imgJumbotronPath.set(fran.imgJumbotronPath || '');
    this.isActive.set(fran.isActive);
    this.order.set(fran.order);
  }
}
