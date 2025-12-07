import { Component, input, output, inject } from '@angular/core';
import { Product } from '../../../features/products/products.model';
import { ProductsService } from '../../../features/products/products.service';
import { FormCheckbox } from '../../form/form-checkbox/form-checkbox';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'tr[app-product-list-item]',
  imports: [FormCheckbox, RouterLink],
  templateUrl: './product-list-item.html',
  styleUrl: '../management-product.scss',
})
export class ProductListItem {
  private productsService = inject(ProductsService);

  // Inputs
  product = input.required<Product>();
  isSelected = input<boolean>(false);

  // Outputs
  selectionChange = output<string>();

  async deleteProduct() {
    const product = this.product();
    if (!product.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);
    if (!confirmed) return;

    try {
      await this.productsService.deleteProduct(product.id);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  }

  onCheckboxChange() {
    const productId = this.product().id;
    if (productId) {
      this.selectionChange.emit(productId);
    }
  }
}
