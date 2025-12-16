import { Component, signal, effect, input, output } from '@angular/core';
import { DimSize, createEmptySize } from '../../../features/dimensions/dimensions.model';
import { FormComponents } from '../../form/form';
import { slugify } from '../../../utils/slug.utils';

@Component({
  selector: 'app-size-form',
  imports: [FormComponents],
  templateUrl: './size-form.html',
  styleUrl: './size-form.scss',
})
export class SizeForm {
  // Size Data received from parent
  size = input<DimSize>(createEmptySize());
  // Loading state
  loading = input<boolean>(false);
  // Reduced version of the form
  reduced = input<boolean>(false);
  // Event emitter for updated sizeData
  updatedSize = output<DimSize>();

  // Form fields
  text = signal<string>('');
  slug = signal<string>('');
  order = signal<number | undefined>(undefined);

  // ============ EFFECTS ==================

  constructor() {
    // Load size data when size changes
    effect(() => this.syncInputToFormFields());
    // Update size model when form fields change
    effect(() => this.emitUpdatedSize());
  }

  // Sync Input size to form fields
  private syncInputToFormFields(): void {
    const s = this.size();
    this.text.set(s.text || '');
    this.slug.set(s.slug || '');
    this.order.set(s.order);
  }

  // Sync form fields to Output size
  private emitUpdatedSize(): void {
    const sizeData: DimSize = {
      text: this.text(),
    };
    // Add slug if provided
    if (this.slug().trim()) {
      sizeData.slug = this.slug().trim();
    }
    // Add order if provided
    if (this.order() !== undefined) {
      sizeData.order = this.order();
    }
    // Emit updated size data
    this.updatedSize.emit(sizeData);
  }

  // ============ ACTIONS ==================

  textBlur() {
    const sizeText = this.text().trim();
    this.slug.set(slugify(sizeText));
  }

  slugBlur() {
    this.slug.set(slugify(this.slug().trim()));
  }
}
