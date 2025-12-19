import { Component, input, output, model, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-form-input',
  imports: [],
  templateUrl: 'form-input.html',
  styleUrl: '../form.scss',
})
export class FormInput {
  // ViewChild for focus control
  private inputElement = viewChild<ElementRef<HTMLInputElement>>('inputEl');

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

  focus() {
    this.inputElement()?.nativeElement.focus();
  }

  // Number input controls
  increment() {
    if (this.type() !== 'number' || this.disabled()) return;

    const currentValue = Number(this.value()) || 0;
    this.value.set(currentValue + 1);
  }

  decrement() {
    if (this.type() !== 'number' || this.disabled()) return;

    const currentValue = Number(this.value()) || 0;
    this.value.set(currentValue - 1);
  }
}

