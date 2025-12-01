import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DashboardProducts } from './pages/dashboard-products/dashboard-products';
import { DashboardImages } from './pages/dashboard-images/dashboard-images';
import { NewProduct } from './pages/new-product/new-product';
import { NewImages } from './pages/new-images/new-images';
import { NotFound } from './pages/not-found/not-found';
import { EditProduct } from './pages/edit-product/edit-product';
import { DashboardDimensions } from './pages/dashboard-dimensions/dashboard-dimensions';
import { EditFranchise } from './pages/edit-franchise/edit-franchise';
import { EditCollection } from './pages/edit-collection/edit-collection';
import { EditManufacturer } from './pages/edit-manufacturer/edit-manufacturer';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: DashboardProducts },
  { path: 'images', component: DashboardImages },
  { path: 'dimensions', component: DashboardDimensions },
  { path: 'new-product', component: NewProduct },
  { path: 'product/:id', component: EditProduct },
  { path: 'franchise/:id', component: EditFranchise },
  { path: 'collection/:id', component: EditCollection },
  { path: 'manufacturer/:id', component: EditManufacturer },
  { path: 'new-images', component: NewImages },
  { path: '**', component: NotFound }
];
