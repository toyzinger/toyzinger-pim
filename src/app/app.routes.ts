import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductsList } from './pages/products-list/products-list';
import { ImagesList } from './pages/images-list/images-list';
import { NewProduct } from './pages/new-product/new-product';
import { UploadImages } from './pages/upload-images/upload-images';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: ProductsList },
  { path: 'images', component: ImagesList },
  { path: 'new-product', component: NewProduct },
  { path: 'upload-images', component: UploadImages }
];
