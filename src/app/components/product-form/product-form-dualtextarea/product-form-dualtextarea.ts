import { Component, input, model } from '@angular/core';
import { FormComponents } from '../../form/form';

@Component({
  selector: 'app-product-form-dualtextarea',
  imports: [FormComponents],
  templateUrl: './product-form-dualtextarea.html',
  styleUrl: './product-form-dualtextarea.scss',
})
export class ProductFormDualtextarea {
  // Inputs
  labelEn = input<string>('English');
  labelEs = input<string>('Spanish');
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
