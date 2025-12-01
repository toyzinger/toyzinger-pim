import { Component, input, inject } from '@angular/core';
import { DimCollection } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { CollectionService } from '../../../features/dimensions/collection/collection.service';


@Component({
  selector: 'tr[app-collection-list-item]',
  imports: [],
  templateUrl: './collection-list-item.html',
  styleUrl: './collection-list-item.scss',
})
export class CollectionListItem {
  collectionService = inject(CollectionService);
  collection = input.required<DimCollection>();

  constructor(private router: Router) {}

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
