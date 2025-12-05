import { Component, inject, OnInit, signal } from '@angular/core';
import { GlobalService } from '../../features/global/global.service';
import { DimensionInfo } from '../../components/dimension-info/dimension-info';
import { dimensionType } from '../../features/dimensions/dimensions.model';
import { FranchiseManagement } from '../../components/management-dim-franchise/franchise-management';
import { CollectionManagement } from "../../components/management-dim-collection/collection-management";
import { ManufacturerManagement } from '../../components/management-dim-manufacturer/manufacturer-management';
import { SubCollectionManagement } from "../../components/management-dim-subcollection/subcollection-management";
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-dashboard-dimensions',
  imports: [
    DimensionInfo,
    FranchiseManagement,
    CollectionManagement,
    ManufacturerManagement,
    SubCollectionManagement,
    TitlePage
],
  templateUrl: './dashboard-dimensions.html',
  styleUrl: './dashboard-dimensions.scss',
})
export class DashboardDimensions implements OnInit {
  private globalService = inject(GlobalService);

  private readonly TAB_STORAGE_KEY = 'dashboard-dimensions-tab';

  // Initialize tab from localStorage or use default 'franchise'
  tab = signal<dimensionType>(
    this.globalService.getLocalStorage<dimensionType>(this.TAB_STORAGE_KEY, 'franchise')
  );

  ngOnInit() {
    this.globalService.setItemType('dimensions');
  }

  onDimensionClick(type: dimensionType) {
    this.tab.set(type);
    // Save to localStorage when tab changes
    this.globalService.setLocalStorage(this.TAB_STORAGE_KEY, type);
  }
}
