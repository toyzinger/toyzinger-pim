import { Component, model, signal, input, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-product-form-accessories',
  imports: [],
  templateUrl: './product-form-accessories.html',
  styleUrls: ['./product-form-accessories.scss'],
})
export class ProductFormAccessories {
  // Inputs
  disabled = input<boolean>(false);

  // Two-way binding for accessories
  accessories = model<{ en: string[]; es: string[] }>({ en: [], es: [] });

  // Internal state
  newAccessoryEs = signal<string>('');
  newAccessoryEn = signal<string>('');
  editingIndex = signal<number | null>(null);

  // ViewChild to select first New Accessory input
  firstNewInput = viewChild<ElementRef<HTMLInputElement>>('newAccessoryInput');

  addAccessory(): void {
    const es = this.newAccessoryEs().trim();
    const en = this.newAccessoryEn().trim();

    if (!es && !en) {
      return;
    }

    const current = this.accessories();
    this.accessories.set({
      en: [...current.en, en],
      es: [...current.es, es],
    });

    this.newAccessoryEs.set('');
    this.newAccessoryEn.set('');
    //
    this.focusFirstInput();
  }

  removeAccessory(index: number): void {
    const current = this.accessories();
    this.accessories.set({
      en: current.en.filter((_, i) => i !== index),
      es: current.es.filter((_, i) => i !== index),
    });
    this.editingIndex.set(null);
  }

  togleEdit(index: number): void {
    if (this.editingIndex() === index) {
      this.editingIndex.set(null);
    } else {
      this.editingIndex.set(index);
    }
  }

  saveEdit(index: number, lang: 'en' | 'es', value: string): void {
    const current = this.accessories();
    const updated = { ...current };
    updated[lang] = [...updated[lang]];
    updated[lang][index] = value.trim();
    this.accessories.set(updated);
    // this.editingIndex.set(null);
  }

  cancelEdit(): void {
    this.editingIndex.set(null);
  }

  isEditing(index: number): boolean {
    return this.editingIndex() === index;
  }

  focusFirstInput(): void {
    setTimeout(() => {
      this.firstNewInput()?.nativeElement.focus();
    }, 0);
  }
}
