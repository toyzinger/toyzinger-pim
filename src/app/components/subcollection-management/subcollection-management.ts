import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { SubCollectionForm } from "./subcollection-form/subcollection-form";
import { SubCollectionListItem } from "./subcollection-list-item/subcollection-list-item";
import { DimSubCollection, createEmptySubCollection } from '../../features/dimensions/dimensions.model';
import { DropdownCollections } from "../dropdown-collections/dropdown-collections";
import { DropdownFranchises } from "../dropdown-franchises/dropdown-franchises";

@Component({
  selector: 'app-subcollection-management',
  imports: [CommonModule, SubCollectionForm, SubCollectionListItem, DropdownCollections, DropdownFranchises],
  templateUrl: './subcollection-management.html',
  styleUrl: './subcollection-management.scss',
})
export class SubCollectionManagement implements OnInit {
  private subcollectionService = inject(SubCollectionService);

  // Use service signals directly
  subcollections = this.subcollectionService.subcollections;
  loading = this.subcollectionService.loading;

  newSubCollection = signal<DimSubCollection>(createEmptySubCollection());

  //Filters
  franchiseSelection = signal<string>('');
  collectionSelection = signal<string>('');

  isValidSubCollection = computed(() => {
    return this.newSubCollection().name.en.trim() !== '' && this.newSubCollection().name.es.trim() !== '';
  });

  filteredSortedSubCollections = computed(() => {
    let finalSubCollections = this.subcollections();
    // Filter by Collection ID
    if (this.collectionSelection() !== '') {
      finalSubCollections = this.subcollections().filter(subcollection => {
        return subcollection.collectionId === this.collectionSelection();
      });
    }
    return finalSubCollections;
  });

  // Get unique collection IDs from all subcollections
  uniqueCollectionIds = computed(() => {
    const collectionIds = this.subcollections()
      .map(subcollection => subcollection.collectionId)
      .filter(id => id && id.trim() !== ''); // Remove empty or null values

    // Return unique IDs
    return [...new Set(collectionIds)] as string[];
  });

  onNewSubCollection(subcollection: DimSubCollection) {
    this.newSubCollection.set(subcollection);
  }

  clearCollectionSelection() {
    this.franchiseSelection.set('');
    this.collectionSelection.set('');
  }

  async addSubCollection() {
    try {
      if (!this.isValidSubCollection()) {
        return;
      }
      await this.subcollectionService.createSubCollection(this.newSubCollection());
      // Clean Form except collectionId
      const cleanSubCollection = createEmptySubCollection();
      cleanSubCollection.collectionId = this.newSubCollection().collectionId;
      this.newSubCollection.set(cleanSubCollection);
    } catch (err) {
      // Error is already handled by the service
      console.error(err);
    }
  }

  // ========================================
  // LIFECYCLE
  // ========================================

  async ngOnInit() {
    await this.subcollectionService.ensureSubCollectionsLoaded();
  }
}
