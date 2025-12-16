import { Component, inject, signal } from '@angular/core';
import { GlobalService } from '../../features/global/global.service';
import { DimensionInfoBox } from '../../components/dimension-info-box/dimension-info-box';
import { dimensionType } from '../../features/dimensions/dimensions.model';
import { FranchiseManagement } from '../../components/management-dim-franchise/franchise-management';
import { CollectionManagement } from "../../components/management-dim-collection/collection-management";
import { ManufacturerManagement } from '../../components/management-dim-manufacturer/manufacturer-management';
import { SubCollectionManagement } from "../../components/management-dim-subcollection/subcollection-management";
import { TitlePage } from "../../components/title-page/title-page";
import { SizeManagement } from "../../components/management-dim-size/size-management";

@Component({
  selector: 'app-dashboard-dimensions',
  imports: [
    DimensionInfoBox,
    FranchiseManagement,
    CollectionManagement,
    ManufacturerManagement,
    SubCollectionManagement,
    SizeManagement,
    TitlePage,
  ],
  templateUrl: './dashboard-dimensions.html',
  styleUrl: './dashboard-dimensions.scss',
})
export class DashboardDimensions {
  private globalService = inject(GlobalService);

  private readonly TAB_STORAGE_KEY = 'dashboard-dimensions-tab';

  // Initialize tab from localStorage or use default 'franchise'
  tab = signal<dimensionType>(
    this.globalService.getLocalStorage<dimensionType>(this.TAB_STORAGE_KEY, 'franchise')
  );

  onDimensionClick(type: dimensionType) {
    this.tab.set(type);
    // Save to localStorage when tab changes
    this.globalService.setLocalStorage(this.TAB_STORAGE_KEY, type);
  }
}
