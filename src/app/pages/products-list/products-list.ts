import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { GlobalService } from '../../features/global/global.service';


@Component({
  selector: 'app-products-list',
  imports: [Sidebar],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('product');
  }
}
