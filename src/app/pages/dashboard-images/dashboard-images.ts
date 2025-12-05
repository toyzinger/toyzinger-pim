import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ImgList } from '../../components/img-list/img-list';
import { GlobalService } from '../../features/global/global.service';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-dashboard-images',
  imports: [Sidebar, ImgList, TitlePage],
  templateUrl: './dashboard-images.html',
  styleUrl: './dashboard-images.scss',
})
export class DashboardImages implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('images');
  }
}
