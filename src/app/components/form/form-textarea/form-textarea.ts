import { Component, input, model, effect, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  imports: [FormsModule],
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

  // ViewChild to access textarea element
  textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textareaElement');

  constructor() {
    // Watch for value changes and resize accordingly
    effect(() => {
      const val = this.value();
      const textareaEl = this.textarea()?.nativeElement;
      if (textareaEl) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => this.resizeTextarea(textareaEl));
      }
    });
  }

  private resizeTextarea(element: HTMLTextAreaElement): void {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }
}
