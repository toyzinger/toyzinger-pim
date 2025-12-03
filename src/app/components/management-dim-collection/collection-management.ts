import { Component, inject, OnInit, computed, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { CollectionForm } from "./collection-form/collection-form";
import { CollectionListItem } from "./collection-list-item/collection-list-item";
import { DimCollection, createEmptyCollection } from '../../features/dimensions/dimensions.model';
import { DropdownFranchises } from "../dropdown-franchises/dropdown-franchises";

@Component({
  selector: 'app-collection-management',
  imports: [CommonModule, CollectionForm, CollectionListItem, DropdownFranchises],
  templateUrl: './collection-management.html',
  styleUrl: './collection-management.scss',
})
export class CollectionManagement implements OnInit {
  private collectionService = inject(CollectionService);

  // Use service signals directly
  collections = this.collectionService.collections;
  loading = this.collectionService.loading;

  newCollection = signal<DimCollection>(createEmptyCollection());
  franchiseSelection = signal<string>('');

  isValidCollection = computed(() => {
    return this.newCollection().name.en.trim() !== '' && this.newCollection().name.es.trim() !== '';
  });

  filteredSortedCollections = computed(() => {
    let finalCollections = this.collections();
    // Filter by Franchise ID
    if (this.franchiseSelection() !== '') {
      finalCollections = this.collections().filter(collection => {
        return collection.franchiseId === this.franchiseSelection();
      });
    }
    return finalCollections;
  });

  // Get unique franchise IDs from all collections
  uniqueFranchiseIds = computed(() => {
    const franchiseIds = this.collections()
      .map(collection => collection.franchiseId)
      .filter(id => id && id.trim() !== ''); // Remove empty or null values

    // Return unique IDs
    return [...new Set(franchiseIds)] as string[];
  });

  onNewCollection(collection: DimCollection) {
    this.newCollection.set(collection);
  }

  clearFranchiseSelection() {
    this.franchiseSelection.set('');
  }

  async addCollection() {
    try {
      if (!this.isValidCollection()) {
        return;
      }
      await this.collectionService.createCollection(this.newCollection());
      // Clean Form except franchiseId and ManufacturerId
      const cleanCollection = createEmptyCollection();
      cleanCollection.franchiseId = this.newCollection().franchiseId;
      cleanCollection.manufacturerId = this.newCollection().manufacturerId;
      this.newCollection.set(cleanCollection);
    } catch (err) {
      // Error is already handled by the service
      console.error(err);
    }
  }

  // ========================================
  // LIFECYCLE
  // ========================================

  async ngOnInit() {
    await this.collectionService.ensureCollectionsLoaded();
  }
}
