import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';


@Component({
  selector: 'app-products-list',
  imports: [Sidebar],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList {

}
