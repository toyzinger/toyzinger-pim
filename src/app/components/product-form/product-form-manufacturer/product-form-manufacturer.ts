import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormSelect, SelectOption } from '../../form/form-select/form-select';
import { MultilingualString } from '../../../features/languages/languages.model';
import { DimensionsService } from '../../../features/dimensions/dimensions.service';

@Component({
  selector: 'app-product-form-manufacturer',
  imports: [FormSelect],
  templateUrl: './product-form-manufacturer.html',
  styleUrl: './product-form-manufacturer.scss',
})
export class ProductFormManufacturer {
  private dimensionsService = inject(DimensionsService);

  // Inputs
  disabled = input<boolean>(false);

  // Two-way binding for the multilingual manufacturer value
  manufacturer = model<MultilingualString | undefined>(undefined);

  // Internal signal to track selected manufacturer ID
  selectedId = signal<string>('');

  // Computed: convert manufacturers to select options
  options = computed<SelectOption[]>(() => {
    return this.dimensionsService.manufacturers().map(manufacturer => ({
      value: manufacturer.id.toString(),
      label: manufacturer.label.en,
    }));
  });

  constructor() {
    // Load initial value when manufacturer changes
    effect(() => {
      const manufacturer = this.manufacturer();
      if (manufacturer) {
        // Find matching manufacturer by comparing labels
        const match = this.dimensionsService.manufacturers().find(
          m => m.label.en === manufacturer.en && m.label.es === manufacturer.es
        );
        if (match) {
          this.selectedId.set(match.id.toString());
        }
      } else {
        this.selectedId.set('');
      }
    });

    // Update manufacturer when selection changes
    effect(() => {
      const id = this.selectedId();
      if (id) {
        const manufacturer = this.dimensionsService.manufacturers().find(m => m.id.toString() === id);
        if (manufacturer) {
          this.manufacturer.set({
            en: manufacturer.label.en,
            es: manufacturer.label.es,
          });
        }
      } else {
        this.manufacturer.set(undefined);
      }
    });
  }
}
