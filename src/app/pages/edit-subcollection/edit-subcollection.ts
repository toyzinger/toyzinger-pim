import { Component, inject, input, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { SubCollectionForm } from "../../components/management-dim-subcollection/subcollection-form/subcollection-form";
import { DimSubCollection, createEmptySubCollection } from '../../features/dimensions/dimensions.model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-edit-subcollection',
  imports: [CommonModule, SubCollectionForm, RouterLink],
  templateUrl: './edit-subcollection.html',
  styleUrl: './edit-subcollection.scss',
})
export class EditSubCollection implements OnInit {
private subcollectionService = inject(SubCollectionService);

  // Input from route param :id
  id = input.required<string>();
  // Find subcollection by ID from the store
  subcollection = computed(() => {
    const subcollectionId = this.id();
    return this.subcollectionService.subcollections().find(sc => sc.id === subcollectionId);
  });
  // Loading state
  loading = this.subcollectionService.loading;
  // Error state
  error = this.subcollectionService.error;

  // Updated subcollection data (from form)
  updatedSubCollectionData = signal<DimSubCollection>(createEmptySubCollection());
  // Check if subcollection data is valid
  isDataValid = computed(() => {
    return this.updatedSubCollectionData().name.en.trim() !== '' || this.updatedSubCollectionData().name.es.trim() !== '';
  });

  ngOnInit() {
    // Ensure subcollections are loaded so we can find the one to edit
    this.subcollectionService.ensureSubCollectionsLoaded();
  }

  // Handle updated subcollection data from the form
  updatedSubCollectionDataChange(updatedSubCollectionData: DimSubCollection) {
    this.updatedSubCollectionData.set(updatedSubCollectionData);
  }

  // Handle form submission (update subcollection)
  onSubmit() {
    if (!this.isDataValid() || this.loading()) {
      return;
    }
    try {
      this.subcollectionService.updateSubCollection(this.id(), this.updatedSubCollectionData());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating subcollection:', error);
    }
  }
}
