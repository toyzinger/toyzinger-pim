import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { GlobalService } from '../../features/global/global.service';
import { ProductList } from "../../components/product-list/product-list";
import { TitlePage } from "../../components/title-page/title-page";


@Component({
  selector: 'app-dashboard-products',
  imports: [Sidebar, ProductList, TitlePage],
  templateUrl: './dashboard-products.html',
  styleUrl: './dashboard-products.scss',
})
export class DashboardProducts implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('products');
  }
}
