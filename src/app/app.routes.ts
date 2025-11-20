import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { Images } from './pages/images/images';
import { NewProduct } from './pages/new-product/new-product';
import { AddImages } from './pages/add-images/add-images';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'images', component: Images },
  { path: 'new-product', component: NewProduct},
  { path: 'add-images', component: AddImages}
];
