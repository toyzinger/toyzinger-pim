import { Component, inject, OnInit, signal } from '@angular/core';
import { GlobalService } from '../../features/global/global.service';
import { DimensionInfo } from '../../components/dimension-info/dimension-info';
import { dimensionType } from '../../features/dimensions/dimensions.model';
import { FranchiseManagement } from '../../components/franchise-management/franchise-management';
import { CollectionManagement } from "../../components/collection-management/collection-management";

@Component({
  selector: 'app-dashboard-dimensions',
  imports: [DimensionInfo, FranchiseManagement, CollectionManagement],
  templateUrl: './dashboard-dimensions.html',
  styleUrl: './dashboard-dimensions.scss',
})
export class DashboardDimensions implements OnInit {
  private globalService = inject(GlobalService);

  tab = signal<dimensionType>('franchise');

  ngOnInit() {
    this.globalService.setItemType('dimensions');
  }

  onDimensionClick(type: dimensionType) {
    this.tab.set(type);
  }
}
