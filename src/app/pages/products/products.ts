import { Component} from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';


@Component({
  selector: 'app-products',
  imports: [Sidebar],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {

}
