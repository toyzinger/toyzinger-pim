import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-form-checkbox',
  imports: [],
  templateUrl: 'form-checkbox.html',
  styleUrl: '../form.scss',
})
export class FormCheckbox {
  // Inputs
  label = input<string>('');
  id = input<string>('');
  disabled = input<boolean>(false);

  // Two-way binding with model signal
  checked = model<boolean>(false);

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
