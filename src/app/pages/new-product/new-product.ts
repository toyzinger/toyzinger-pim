import { Component, inject, signal } from '@angular/core';
import { Product } from '../../features/products/products.model';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductsStore } from '../../features/products/products.store';
import { ToastService } from '../../features/toast/toast.service';

@Component({
  selector: 'app-new-product',
  imports: [ProductForm],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {
  private productsStore = inject(ProductsStore);
  private toastService = inject(ToastService);

  // Expose store state to template
  loading = this.productsStore.loading;

  async onSubmitProduct(productData: Omit<Product, 'id'>) {
    // Logic to handle new product submission
    console.log('New product submitted!', productData);
    try {
      await this.productsStore.createProduct(productData);
      this.toastService.success(`Product Created: ${productData.name}`);
    } catch (error) {
      this.toastService.danger('Failed to create product');
    }
  }
}
