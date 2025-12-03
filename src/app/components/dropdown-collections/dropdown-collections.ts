import { Component, inject, model, input, computed, OnInit } from '@angular/core';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-dropdown-collections',
  imports: [FormSelect],
  templateUrl: 'dropdown-collections.html',
  styleUrl: 'dropdown-collections.scss',
})
export class DropdownCollections implements OnInit {
  private collectionService = inject(CollectionService);

  // ========================================
  // INPUTS
  // ========================================

  label = input<string>('Collection');
  placeholder = input<string>('Select a collection');
  id = input<string>('collection-select');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  language = input<'en' | 'es'>('en'); // Language for collection names
  filteredByFranchise = input<string>(''); // FranchiseId to filter collections by


  // ========================================
  // TWO-WAY BINDING
  // ========================================

  // Model for selected collection ID
  value = model<string>('');

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Get collections, optionally filtered by ID array
  collections = computed(() => {
    const allCollections = this.collectionService.sortedCollections();
    const franchiseId = this.filteredByFranchise();

    // If filtered array is empty, return all collections
    if (franchiseId === '') {
      return allCollections;
    }

    // Otherwise, only return collections whose ID is in the filtered array
    return allCollections.filter(collection => collection.franchiseId === franchiseId);
  });

  // Convert collections to SelectOption[] for FormSelect
  collectionOptions = computed<SelectOption[]>(() => {
    const lang = this.language();
    return this.collections().map(collection => ({
      value: collection.id || '',
      label: collection.name[lang] || collection.name.en || 'Unnamed Collection',
    }));
  });

  // ========================================
  // LIFECYCLE
  // ========================================

  ngOnInit() {
    // Load collections when component is initialized
    this.collectionService.ensureCollectionsLoaded();
  }
}
