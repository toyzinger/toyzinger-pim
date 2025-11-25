import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ImgList } from '../../components/img-list/img-list';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-images-list',
  imports: [Sidebar, ImgList],
  templateUrl: './images-list.html',
  styleUrl: './images-list.scss',
})
export class ImagesList implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('image');
  }
}
