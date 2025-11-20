import { Component, signal } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { FormComponents } from '../../components/form/form';
import { SelectOption } from '../../components/form/form-select/form-select';

@Component({
  selector: 'app-images-list',
  imports: [Sidebar, FormComponents],
  templateUrl: './images-list.html',
  styleUrl: './images-list.scss',
})
export class ImagesList {
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
