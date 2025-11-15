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
  // Inputs
  label = input<string>('');
  id = input<string>('');
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
}
