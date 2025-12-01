import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { CollectionForm } from "./collection-form/collection-form";
import { CollectionListItem } from "./collection-list-item/collection-list-item";
import { DimCollection, createEmptyCollection } from '../../features/dimensions/dimensions.model';

@Component({
  selector: 'app-collection-management',
  imports: [CommonModule, CollectionForm, CollectionListItem],
  templateUrl: './collection-management.html',
  styleUrl: './collection-management.scss',
})
export class CollectionManagement implements OnInit {
  private collectionService = inject(CollectionService);

  // Use service signals directly
  collections = this.collectionService.collections;
  loading = this.collectionService.loading;
  error = this.collectionService.error;

  newCollection = signal<DimCollection>(createEmptyCollection());

  isValidCollection = computed(() => {
    return this.newCollection().name.en.trim() !== '' && this.newCollection().name.es.trim() !== '';
  });

  alphaSortCollections = computed(() => {
    return this.collections().sort((a, b) => {
      const nameA = a.name.en.toLowerCase();
      const nameB = b.name.en.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  });

  async ngOnInit() {
    await this.collectionService.ensureCollectionsLoaded();
  }

  onNewCollection(collection: DimCollection) {
    console.log('onNewCollection', collection);
    this.newCollection.set(collection);
  }

  async addCollection() {
    try {
      if (!this.isValidCollection()) {
        return;
      }
      await this.collectionService.createCollection(this.newCollection());
      this.newCollection.set(createEmptyCollection());
    } catch (err) {
      // Error is already handled by the service
      console.error(err);
    }
  }
}
