import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductsList } from './pages/products-list/products-list';
import { ImagesList } from './pages/images-list/images-list';
import { NewProduct } from './pages/new-product/new-product';
import { NewImages } from './pages/new-images/new-images';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: ProductsList },
  { path: 'images', component: ImagesList },
  { path: 'new-product', component: NewProduct },
  { path: 'new-images', component: NewImages },
  { path: '**', component: NotFound }
];
