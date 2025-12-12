import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ManagementPimages } from '../../components/management-pimages/management-pimages';
import { GlobalService } from '../../features/global/global.service';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-dashboard-images',
  imports: [Sidebar, ManagementPimages, TitlePage],
  templateUrl: './dashboard-images.html',
  styleUrl: './dashboard-images.scss',
})
export class DashboardImages implements OnInit {
  private globalService = inject(GlobalService);

  ngOnInit() {
    this.globalService.setItemType('images');
  }
}
