import { Component, input, inject, computed } from '@angular/core';
import { DimSubCollection } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { ProductsService } from '../../../features/products/products.service';
import { SubCollectionService } from '../../../features/dimensions/subcollection/subcollection.service';
import { CollectionService } from '../../../features/dimensions/collection/collection.service';
import { FormsModule } from '@angular/forms';
import { ImagesService } from '../../../features/pimages/pimages.service';
import { FormOrderList } from "../../form/form-order-list/form-order-list";


@Component({
  selector: 'tr[app-subcollection-list-item]',
  imports: [FormsModule, FormOrderList],
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

  updateOrder(newValue: number | undefined) {
    const subcollectionId = this.subcollection().id;
    if (
      !subcollectionId
      || newValue === undefined
      || newValue < 0
      || isNaN(newValue)
      || newValue === this.subcollection().order
    ) {
        //Escape hatch for invalid values
        return;
    }

    this.subcollectionService.updateSubCollection(subcollectionId, { order: newValue });
  }
}
