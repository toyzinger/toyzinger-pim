import { Component, signal, effect, input, output } from '@angular/core';
import { DimManufacturer, createEmptyManufacturer } from '../../../features/dimensions/dimensions.model';
import { FormComponents } from '../../form/form';
import { slugify } from '../../../utils/slug.utils';

@Component({
  selector: 'app-manufacturer-form',
  imports: [FormComponents],
  templateUrl: './manufacturer-form.html',
  styleUrl: './manufacturer-form.scss',
})
export class ManufacturerForm {

  // Manufacturer Data received from parent
  manufacturer = input<DimManufacturer>(createEmptyManufacturer());
  // Loading state
  loading = input<boolean>(false);
  // Reduced version of the form
  reduced = input<boolean>(false);
  // Event emitter for updated manufacturerData
  updatedManufacturer = output<DimManufacturer>();

  // Form fields
  name = signal<string>('');
  slug = signal<string>('');
  order = signal<number | undefined>(undefined);

  constructor() {
    // Load manufacturer data when manufacturer changes
    effect(() => {
      this.loadManufacturerData(this.manufacturer());
    });
    // Update manufacturer model when form fields change
    effect(() => {
      const manufacturerData: DimManufacturer = {
        name: this.name(),
      };
      // Add slug if provided
      if (this.slug().trim()) {
        manufacturerData.slug = this.slug().trim();
      }
      // Add order if provided
      if (this.order() !== undefined) {
        manufacturerData.order = this.order();
      }
      // Emit updated manufacturer data
      this.updatedManufacturer.emit(manufacturerData);
    });
  }

  nameBlur() {
    const manufacturerName = this.name().trim();
    this.slug.set(slugify(manufacturerName));
  }

  slugBlur() {
    this.slug.set(slugify(this.slug().trim()));
  }

  private loadManufacturerData(man: DimManufacturer): void {
    this.name.set(man.name || '');
    this.slug.set(man.slug || '');
    this.order.set(man.order);
  }
}
