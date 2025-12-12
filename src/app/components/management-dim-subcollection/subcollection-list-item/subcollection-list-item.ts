import { Component, input, inject, computed } from '@angular/core';
import { DimSubCollection } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { ProductsService } from '../../../features/products/products.service';
import { SubCollectionService } from '../../../features/dimensions/subcollection/subcollection.service';
import { CollectionService } from '../../../features/dimensions/collection/collection.service';
import { FormsModule } from '@angular/forms';
import { ImagesService } from '../../../features/pimages/pimages.service';


@Component({
  selector: 'tr[app-subcollection-list-item]',
  imports: [FormsModule],
  templateUrl: './subcollection-list-item.html',
  styleUrl: './subcollection-list-item.scss',
})
export class SubCollectionListItem {
  // Injected Services
  private productService = inject(ProductsService);
  private imagesService = inject(ImagesService);
  private subcollectionService = inject(SubCollectionService);
  private collectionService = inject(CollectionService);
  private router = inject(Router);

  // =========== INPUTS =======================

  subcollection = input.required<DimSubCollection>();

  // =========== COMPUTED VALUES =======================

  collectionName = computed(() => {
    const collectionId = this.subcollection().collectionId;
    if (!collectionId) return 'Unknown Collection';
    return this.collectionService.getCollectionById()(collectionId)?.name.en || 'Unknown Collection';
  });

  // =========== ACTIONS =======================

  onEdit() {
    this.router.navigate(['subcollection', this.subcollection().id]);
  }

  onDelete() {
    const subcollectionId = this.subcollection().id;
    if (subcollectionId && confirm('Are you sure you want to delete this subcollection?')) {
      this.subcollectionService.deleteSubCollection(subcollectionId);
      this.productService.clearProductsBySubcollection(subcollectionId);
      this.imagesService.clearImagesBySubcollection(subcollectionId);
    }
  }

  updateOrder(event: Event) {
    const subcollectionId = this.subcollection().id;
    const newOrderStr = (event.target as HTMLInputElement).value;
    const newOrder = parseInt(newOrderStr, 10);

    // Validate it's a valid number and different from current
    if (subcollectionId && !isNaN(newOrder) && newOrder !== this.subcollection().order) {
      this.subcollectionService.updateSubCollection(subcollectionId, { order: newOrder });
    }
  }
}
