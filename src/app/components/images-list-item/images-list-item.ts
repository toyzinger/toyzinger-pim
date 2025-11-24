import { Component, input, inject, signal, effect } from '@angular/core';
import { ProductImage } from '../../features/productimages/productimages.model';
import { ImagesService } from '../../features/productimages/productimages.service';
import { FormInput } from '../form/form-input/form-input';

@Component({
  selector: 'app-images-list-item',
  imports: [FormInput],
  templateUrl: './images-list-item.html',
  styleUrl: './images-list-item.scss',
})
export class ImagesListItem {
  private imagesService = inject(ImagesService);

  // Input from parent
  image = input.required<ProductImage>();

  // Local state for alt text
  altText = signal<string>('');
  isEditing = signal(false);

  constructor() {
    // Initialize alt text from image when it changes
    effect(() => {
      const img = this.image();
      this.altText.set(img.alt || '');
    });
  }

  async updateAlt() {
    const img = this.image();
    const newAlt = this.altText();

    if (img.id && newAlt !== img.alt) {
      try {
        await this.imagesService.updateImage(img.id, { alt: newAlt });
        this.isEditing.set(false);
      } catch (error) {
        console.error('Failed to update alt text:', error);
      }
    }
  }

  async deleteImage() {
    const img = this.image();

    if (!img.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${img.filename}"? This action cannot be undone.`);

    if (confirmed) {
      try {
        // Delete from Firestore and API
        await this.imagesService.deleteImage(img.id);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  }

  onAltBlur() {
    this.updateAlt();
  }
}
