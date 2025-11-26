import { Component, inject, signal } from '@angular/core';
import { Product } from '../../features/products/products.model';
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

  // Expose store state to template
  loading = this.productsStore.loading;

  async onSubmitProduct(productData: Omit<Product, 'id'>) {
    // Add selected folder to product data (convert null to undefined)
    const folderId = this.selectedFolderId();
    const productWithFolder = {
      ...productData,
      ...(folderId && { folderId })
    };

    console.log('New product submitted!', productWithFolder);
    try {
      await this.productsStore.createProduct(productWithFolder);
      this.toastService.success(`Product Created: ${productData.name}`);
    } catch (error) {
      this.toastService.danger('Failed to create product');
    }
  }
}
