import { Component, signal } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { FormComponents } from '../../components/form/form';
import { SelectOption } from '../../components/form/form-select/form-select';

@Component({
  selector: 'app-images',
  imports: [Sidebar, FormComponents],
  templateUrl: './images.html',
  styleUrl: './images.scss',
})
export class Images {
  productName = signal('');
  description = signal('');
  category = signal('');

  categoryOptions: SelectOption[] = [
    { value: 'toys', label: 'Juguetes' },
    { value: 'games', label: 'Juegos' },
    { value: 'collectibles', label: 'Coleccionables' },
    { value: 'others', label: 'Otros' },
  ];
}
