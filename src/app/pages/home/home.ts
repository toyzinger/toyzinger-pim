import { Component, inject, OnInit } from '@angular/core';
import { ToastService } from '../../features/toast/toast.service';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-home',
  imports: [ProductForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private toastService = inject(ToastService);

  ngOnInit() {
    // Mostrar mensajes
    // this.toastService.success('Product saved!');
  }
}
