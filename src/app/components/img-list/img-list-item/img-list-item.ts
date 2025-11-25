import { Component, input, output, inject, signal, effect } from '@angular/core';
import { ProductImage } from '../../../features/productimages/productimages.model';
import { ImagesService } from '../../../features/productimages/productimages.service';
import { FormInput } from '../../form/form-input/form-input';
import { FormCheckbox } from '../../form/form-checkbox/form-checkbox';

@Component({
  selector: 'tr[app-img-list-item]',
  imports: [FormInput, FormCheckbox],
  templateUrl: './img-list-item.html',
  styleUrl: '../img-list.scss',
})
export class ImgListItem {
  private imagesService = inject(ImagesService);

  // Inputs from parent
  image = input.required<ProductImage>();
  isSelected = input<boolean>(false); // Controlled by parent

  // Output to parent
  selectionChange = output<string>(); // Emit image ID when selection changes

  // Local state for alt text
  altText = signal<string>('');
  isEditing = signal(false);

  constructor() {
    // Initialize alt text from image when it changes
    effect(() => {
      const image = this.image();
      this.altText.set(image.alt || '');
    });
  }

  onAltBlur() {
    const image = this.image();
    const currentAlt = image.alt || '';
    const newAlt = this.altText().trim();

    // Only save if changed
    if (newAlt !== currentAlt && image.id) {
      this.imagesService.updateImage(image.id, { alt: newAlt });
    }
  }

  async deleteImage() {
    const image = this.image();
    if (!image.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${image.filename}"?`);
    if (!confirmed) return;

    try {
      await this.imagesService.deleteImage(image.id);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  }

  onCheckboxChange() {
    const imageId = this.image().id;
    if (imageId) {
      this.selectionChange.emit(imageId);
    }
  }
}
