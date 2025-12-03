import { Component, input, inject, computed } from '@angular/core';
import { DimCollection } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { CollectionService } from '../../../features/dimensions/collection/collection.service';
import { FranchiseService } from '../../../features/dimensions/franchise/franchise.service';
import { ManufacturerService } from '../../../features/dimensions/manufacturer/manufacturer.service';

@Component({
  selector: 'tr[app-collection-list-item]',
  imports: [],
  templateUrl: './collection-list-item.html',
  styleUrl: './collection-list-item.scss',
})
export class CollectionListItem {
  collectionService = inject(CollectionService);
  franchiseService = inject(FranchiseService);
  manufacturerService = inject(ManufacturerService);
  collection = input.required<DimCollection>();

  constructor(private router: Router) {}

  franchiseName = computed(() => {
    const franchiseId = this.collection().franchiseId;
    if (!franchiseId) return 'Unknown Franchise';
    return this.franchiseService.getFranchiseById()(franchiseId)?.name.en;
  });

  manufacturerName = computed(() => {
    const manufacturerId = this.collection().manufacturerId;
    if (!manufacturerId) return 'Unknown Manufacturer';
    return this.manufacturerService.getManufacturerById()(manufacturerId)?.name;
  });

  onEdit() {
    this.router.navigate(['collection', this.collection().id]);
  }

  onDelete() {
    const collectionId = this.collection().id;
    if (collectionId && confirm('Are you sure you want to delete this collection?')) {
      this.collectionService.deleteCollection(collectionId);
    }
  }
}
