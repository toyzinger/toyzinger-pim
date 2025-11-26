import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { GlobalService } from '../../features/global/global.service';
import { ProductList } from "../../components/product-list/product-list";


@Component({
  selector: 'app-products-list',
  imports: [Sidebar, ProductList],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('products');
  }
}
