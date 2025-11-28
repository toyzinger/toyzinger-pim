import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ImgList } from '../../components/img-list/img-list';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-dashboard-images',
  imports: [Sidebar, ImgList],
  templateUrl: './dashboard-images.html',
  styleUrl: './dashboard-images.scss',
})
export class DashboardImages implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('images');
  }
}
