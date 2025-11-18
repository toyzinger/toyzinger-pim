import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProductsFirebase } from '../../features/products/products.firebase';
import { ToastService } from '../../features/toast/toast.service';
import { Product } from '../../features/products/products.model';

@Component({
  selector: 'app-products',
  imports: [Sidebar, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private productService = inject(ProductsFirebase);
  private toastService = inject(ToastService);

  product = signal<Partial<Product>>({
    name: '',
    isActive: true,
    franchiseId: undefined,
    manufacturerId: undefined,
    yearReleased: undefined,
    collection: '',
    size: '',
    sku: ''
  });

  isLoading = signal<boolean>(false);

  async onSubmit() {
    const productData = this.product();

    if (!productData.name) {
      this.toastService.warning('Product name is required');
      return;
    }

    this.isLoading.set(true);

    try {
      const id = await this.productService.addProduct({
        name: productData.name,
        isActive: productData.isActive ?? true,
        franchiseId: productData.franchiseId,
        manufacturerId: productData.manufacturerId,
        yearReleased: productData.yearReleased,
        collection: productData.collection || '',
        size: productData.size,
        sku: productData.sku
      });

      this.toastService.success(`Product created successfully!`);
      this.resetForm();
    } catch (error) {
      this.toastService.danger('Error creating product: ' + error);
    } finally {
      this.isLoading.set(false);
    }
  }

  resetForm() {
    this.product.set({
      name: '',
      isActive: true,
      franchiseId: undefined,
      manufacturerId: undefined,
      yearReleased: undefined,
      collection: '',
      size: '',
      sku: ''
    });
  }
}
