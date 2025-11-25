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

  onCheckboxChange() {
    const imageId = this.image().id;
    if (imageId) {
      this.selectionChange.emit(imageId);
    }
  }
}
