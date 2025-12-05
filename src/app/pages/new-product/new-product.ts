import { Component, inject, signal } from '@angular/core';
import { Product, createEmptyProduct } from '../../features/products/products.model';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductsService } from '../../features/products/products.service';
import { ToastService } from '../../features/toast/toast.service';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-new-product',
  imports: [ProductForm, TitlePage],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {
  private productService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Product data bound to the form
  initialProductData: Product = createEmptyProduct();

  // Product data updated by the form
  updatedProductData = signal<Product>(createEmptyProduct());

  // Expose store state to template
  loading = this.productService.loading;

  updatedProductDataChange(product: Product) {
    this.updatedProductData.set(product);
  }

  async onSubmit() {
    const data = this.updatedProductData();
    // Validate required fields
    if (!data.name.trim()) {
      this.toastService.error('Product name is required');
      return;
    }
    // Create product
    try {
      await this.productService.createProduct(data);
      this.toastService.success(`Product Created: ${data.name}`);
      // Clear Necessary Data
      this.initialProductData = Object.assign(data, {
        name: '',
        accessories: undefined,
        characterDescription: undefined,
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      this.toastService.error('Failed to create product');
    }
  }
}
