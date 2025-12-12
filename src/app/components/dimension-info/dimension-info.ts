import { Component, input, inject, computed } from '@angular/core';
import { dimensionType } from '../../features/dimensions/dimensions.model';
import { CommonModule } from '@angular/common';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';

@Component({
  selector: 'app-dimension-info',
  imports: [CommonModule],
  templateUrl: './dimension-info.html',
  styleUrl: './dimension-info.scss',
})
export class DimensionInfo {
  // Inject all dimension services
  private franchiseService = inject(FranchiseService);
  private collectionService = inject(CollectionService);
  private subcollectionService = inject(SubCollectionService);
  private manufacturerService = inject(ManufacturerService);

  // Input: dimension type
  type = input.required<dimensionType>();

  // Computed: total count based on dimension type
  total = computed(() => {
    const dimensionType = this.type();

    switch (dimensionType) {
      case 'franchise':
        return this.franchiseService.franchiseCount();
      case 'collection':
        return this.collectionService.collectionCount();
      case 'subcollection':
        return this.subcollectionService.subcollectionCount();
      case 'manufacturer':
        return this.manufacturerService.manufacturerCount();
      default:
        return 0;
    }
  });

  // ===== LIFECYCLE =====

  ngOnInit() {
    this.franchiseService.ensureFranchisesLoaded();
    this.collectionService.ensureCollectionsLoaded();
    this.subcollectionService.ensureSubCollectionsLoaded();
    this.manufacturerService.ensureManufacturersLoaded();
  }
}
