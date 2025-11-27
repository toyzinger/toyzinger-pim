import { Component, inject, input, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../features/products/products.service';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ProductForm],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.scss',
})
export class EditProduct implements OnInit {
  private productsService = inject(ProductsService);

  // Input from route param :id
  id = input.required<string>();

  // Find product by ID from the store
  product = computed(() => {
    const productId = this.id();
    return this.productsService.products().find(p => p.id === productId);
  });

  loading = this.productsService.loading;
  error = this.productsService.error;

  ngOnInit() {
    // Ensure products are loaded so we can find the one to edit
    this.productsService.ensureProductsLoaded();
  }
}
