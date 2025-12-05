import { Component, inject, input, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { CollectionForm } from "../../components/management-dim-collection/collection-form/collection-form";
import { DimCollection, createEmptyCollection } from '../../features/dimensions/dimensions.model';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-edit-collection',
  imports: [CommonModule, CollectionForm, TitlePage],
  templateUrl: './edit-collection.html',
  styleUrl: './edit-collection.scss',
})
export class EditCollection implements OnInit {
private collectionService = inject(CollectionService);

  // Input from route param :id
  id = input.required<string>();
  // Find collection by ID from the store
  collection = computed(() => {
    const collectionId = this.id();
    return this.collectionService.collections().find(c => c.id === collectionId);
  });
  // Loading state
  loading = this.collectionService.loading;
  // Error state
  error = this.collectionService.error;

  // Updated collection data (from form)
  updatedCollectionData = signal<DimCollection>(createEmptyCollection());
  // Check if collection data is valid
  isDataValid = computed(() => {
    return this.updatedCollectionData().name.en.trim() !== '' || this.updatedCollectionData().name.es.trim() !== '';
  });

  ngOnInit() {
    // Ensure collections are loaded so we can find the one to edit
    this.collectionService.ensureCollectionsLoaded();
  }

  // Handle updated collection data from the form
  updatedCollectionDataChange(updatedCollectionData: DimCollection) {
    this.updatedCollectionData.set(updatedCollectionData);
  }

  // Handle form submission (update collection)
  onSubmit() {
    if (!this.isDataValid() || this.loading()) {
      return;
    }
    try {
      this.collectionService.updateCollection(this.id(), this.updatedCollectionData());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  }
}
