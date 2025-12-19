import { Component, input, model, computed } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-form-select',
  imports: [],
  templateUrl: 'form-select.html',
  styleUrl: '../form.scss',
})
export class FormSelect {
  // Generate unique ID for each instance
  readonly id = `form-select-${Math.random().toString(36).substring(2, 11)}`;

  // Inputs
  label = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  options = input<SelectOption[]>([]);
  placeholder = input<string>('---');

  // Two-way binding with model signal
  value = model<string>('');

  // Computed: detects if current value is empty (disabled/placeholder option)
  isPlaceholderSelected = computed(() => this.value() === '');

  onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.value.set(target.value);
  }

  openSelect() {
    if (this.disabled()) return;
    const selectElement = document.getElementById(this.id) as HTMLSelectElement | null;
    if (!selectElement) return;

    try {
      // Try modern showPicker() API
      (selectElement as any).showPicker();
    } catch (error) {
      // Fallback to focus if showPicker not supported or fails
      selectElement.focus();
    }
  }
}
