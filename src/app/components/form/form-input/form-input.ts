import { Component, input, output, model } from '@angular/core';

@Component({
  selector: 'app-form-input',
  imports: [],
  templateUrl: 'form-input.html',
  styleUrl: '../form.scss',
})
export class FormInput {
  // Inputs
  type = input<string>('text');
  label = input<string>('');
  placeholder = input<string>('');
  id = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false);

  // Two-way binding with model signal
  value = model<string | number | undefined>('');

  // Outputs
  blur = output<void>();

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }

  onBlur() {
    this.blur.emit();
  }
}
