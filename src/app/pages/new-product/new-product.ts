import { Component, inject, signal } from '@angular/core';
import { Product, createEmptyProduct } from '../../features/products/products.model';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductsService } from '../../features/products/products.service';
import { ToastService } from '../../features/toast/toast.service';
import { FoldersDropdown } from '../../components/folders-dropdown/folders-dropdown';

@Component({
  selector: 'app-new-product',
  imports: [ProductForm, FoldersDropdown],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct {
  private productsStore = inject(ProductsService);
  private toastService = inject(ToastService);

  selectedFolderId = signal<string | null>(null);

  // Product data bound to the form
  initialProductData: Product = createEmptyProduct();

  // Product data updated by the form
  updatedProductData = signal<Product>(createEmptyProduct());

  // Expose store state to template
  loading = this.productsStore.loading;

  updatedProductDataChange(product: Product) {
    this.updatedProductData.set(product);
  }

  async onSubmit() {
    const data = this.updatedProductData();
    // Validate required fields
    if (!data.name.trim()) {
      this.toastService.danger('Product name is required');
      return;
    }
    // Add selected folder to product data (convert null to undefined)
    const folderId = this.selectedFolderId();
    const productWithFolder = {
      ...data,
      ...(folderId && { folderId })
    };
    // Create product
    console.log('New product submitted!', productWithFolder);
    try {
      await this.productsStore.createProduct(productWithFolder);
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
      this.toastService.danger('Failed to create product');
    }
  }
}
