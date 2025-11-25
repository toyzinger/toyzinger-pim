import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ImgList } from '../../components/img-list/img-list';

@Component({
  selector: 'app-images-list',
  imports: [Sidebar, ImgList],
  templateUrl: './images-list.html',
  styleUrl: './images-list.scss',
})
export class ImagesList {
}
