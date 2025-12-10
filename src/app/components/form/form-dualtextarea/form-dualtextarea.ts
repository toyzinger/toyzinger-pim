import { Component, input, model } from '@angular/core';
import { FormTextarea } from '../form-textarea/form-textarea';

@Component({
  selector: 'app-form-dualtextarea',
  imports: [FormTextarea],
  templateUrl: 'form-dualtextarea.html',
  styleUrl: '../form.scss',
})
export class FormDualtextarea {
  // Inputs
  disabled = input<boolean>(false);

  // Two-way binding for both textareas
  valueEn = model<string>('');
  valueEs = model<string>('');

  // Copy text from Spanish to English
  copyToEnglish(): void {
    this.valueEn.set(this.valueEs());
  }

  // Translate text (placeholder for future implementation)
  translate(): void {
    console.log('Translate functionality - Coming soon');
  }

  // Clear both textareas
  clear(): void {
    this.valueEs.set('');
    this.valueEn.set('');
  }
}
