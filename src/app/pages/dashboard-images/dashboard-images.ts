import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ManagementPimages } from '../../components/management-pimages/management-pimages';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-dashboard-images',
  imports: [Sidebar, ManagementPimages, TitlePage],
  templateUrl: './dashboard-images.html',
  styleUrl: './dashboard-images.scss',
})
export class DashboardImages {}
