import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormSelect, SelectOption } from '../../form/form-select/form-select';
import { MultilingualString } from '../../../features/languages/languages.model';
import { DimensionsService } from '../../../features/dimensions/dimensions.service';

@Component({
  selector: 'app-product-form-franchise',
  imports: [FormSelect],
  templateUrl: './product-form-franchise.html',
  styleUrl: './product-form-franchise.scss',
})
export class ProductFormFranchise {
  private dimensionsService = inject(DimensionsService);

  // Inputs
  disabled = input<boolean>(false);

  // Two-way binding for the multilingual franchise value
  franchise = model<MultilingualString | undefined>(undefined);

  // Internal signal to track selected franchise ID
  selectedId = signal<string>('');

  // Computed: convert franchises to select options
  options = computed<SelectOption[]>(() => {
    return this.dimensionsService.franchises().map(franchise => ({
      value: franchise.id.toString(),
      label: franchise.label.en,
    }));
  });

  constructor() {
    // Load initial value when franchise changes
    effect(() => {
      const franchise = this.franchise();
      if (franchise) {
        // Find matching franchise by comparing labels
        const match = this.dimensionsService.franchises().find(
          f => f.label.en === franchise.en && f.label.es === franchise.es
        );
        if (match) {
          this.selectedId.set(match.id.toString());
        }
      } else {
        this.selectedId.set('');
      }
    });

    // Update franchise when selection changes
    effect(() => {
      const id = this.selectedId();
      if (id) {
        const franchise = this.dimensionsService.franchises().find(f => f.id.toString() === id);
        if (franchise) {
          const value = {
            en: franchise.label.en,
            es: franchise.label.es,
          }
          this.franchise.set(value);
        }
      } else {
        this.franchise.set(undefined);
      }
    });
  }
}
