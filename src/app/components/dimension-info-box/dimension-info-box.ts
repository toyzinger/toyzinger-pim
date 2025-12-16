import { Component, input, inject, computed } from '@angular/core';
import { dimensionType } from '../../features/dimensions/dimensions.model';
import { CommonModule } from '@angular/common';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';
import { SizeService } from '../../features/dimensions/size/size.service';

@Component({
  selector: 'app-dimension-info-box',
  imports: [CommonModule],
  templateUrl: './dimension-info-box.html',
  styleUrl: './dimension-info-box.scss',
})
export class DimensionInfoBox {
  // Inject all dimension services
  private franchiseService = inject(FranchiseService);
  private collectionService = inject(CollectionService);
  private subcollectionService = inject(SubCollectionService);
  private manufacturerService = inject(ManufacturerService);
  private sizeService = inject(SizeService);

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
      case 'size':
        return this.sizeService.sizeCount();
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
    this.sizeService.ensureSizesLoaded();
  }
}
