import { Component, input, output, model } from '@angular/core';

@Component({
  selector: 'app-form-textarea',
  imports: [],
  templateUrl: 'form-textarea.html',
  styleUrl: '../form.scss',
})
export class FormTextarea {
  // Inputs
  label = input<string>('');
  placeholder = input<string>('');
  id = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  rows = input<number>(4);

  // Two-way binding with model signal
  value = model<string>('');

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }
}
