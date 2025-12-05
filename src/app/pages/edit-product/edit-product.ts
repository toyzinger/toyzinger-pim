import { Component, inject, input, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../features/products/products.service';
import { ProductForm } from '../../components/product-form/product-form';
import { createEmptyProduct, Product } from '../../features/products/products.model';
import { ToastService } from '../../features/toast/toast.service';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    ProductForm,
    TitlePage
],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.scss',
})
export class EditProduct implements OnInit {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Input from route param :id
  id = input.required<string>();
  // Updated product data
  updatedProductData = signal<Product>(createEmptyProduct());
  // Find product by ID from the store
  product = computed(() => {
    const productId = this.id();
    return this.productsService.products().find(p => p.id === productId);
  });
  // Check if Product data is valid
  isDataValid = computed(() => {
    return this.updatedProductData().name.trim() !== '';
  });
  // Loading state
  loading = this.productsService.loading;
  // Error state
  error = this.productsService.error;

  ngOnInit() {
    // Ensure products are loaded so we can find the one to edit
    this.productsService.ensureProductsLoaded();
  }

  updatedProductDataChange(updatedProductData: Product) {
    this.updatedProductData.set(updatedProductData);
  }

  async onSubmit() {
    if (!this.isDataValid() || this.loading()) {
      return;
    }
    try {
      await this.productsService.updateProduct(this.id(), this.updatedProductData());
      this.toastService.success('Product updated successfully');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }
}
