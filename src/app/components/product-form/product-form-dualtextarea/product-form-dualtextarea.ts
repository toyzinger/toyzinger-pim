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
  placeholderEn = input<string>('Enter text in English');
  placeholderEs = input<string>('Enter text in Spanish');
  disabled = input<boolean>(false);

  // Two-way binding for both textareas
  valueEn = model<string>('');
  valueEs = model<string>('');

  // Copy text from Spanish to English
  copyToEnglish(): void {
    this.valueEn.set(this.valueEs());
  }
}
