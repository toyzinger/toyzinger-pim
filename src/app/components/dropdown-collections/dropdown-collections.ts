import { Component, inject, model, input, computed, OnInit, effect, untracked } from '@angular/core';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-dropdown-collections',
  imports: [FormSelect],
  templateUrl: 'dropdown-collections.html',
  styleUrl: 'dropdown-collections.scss',
})
export class DropdownCollections implements OnInit {
  private globalService = inject(GlobalService);
  private collectionService = inject(CollectionService);
  private franchiseService = inject(FranchiseService);

  // Get global loading state
  loading = this.globalService.loading;

  // ============ INPUTS ==================

  label = input<string>('Collection');
  placeholder = input<string>('Select a collection');
  language = input<'en' | 'es'>('en'); // Language for collection names

  // ============ COMPUTED VALUES ==================

  // Current selected collection from service
  currentValue = computed(() => this.collectionService.selectedCollectionId());
  // Get current franchise selection from service
  franchiseId = computed(() => this.franchiseService.selectedFranchiseId());
  // Get collections, filtered by global franchise selection
  collections = computed(() => {
    const allCollections = this.collectionService.sortedCollections();
    const franchiseId = this.franchiseId();
    if (!franchiseId) return [];
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

  // ============ EFFECTS ==================

  constructor() {
    // Validate collection when franchise changes
    effect(() => this.validateCollectionAgainstFranchise());
  }

  // Ensure selected collection belongs to the selected franchise
  private validateCollectionAgainstFranchise(): void {
    const franchiseId = this.franchiseId();
    const collectionId = untracked(() => this.currentValue());

    if (collectionId) {
      const collection = this.collectionService.getCollectionById()(collectionId);
      // Clear collection if franchise is cleared OR if collection doesn't belong to new franchise
      if (!franchiseId || (collection && collection.franchiseId !== franchiseId)) {
        this.collectionService.clearSelectedCollectionId();
      }
    }
  }

  // ============ ACTIONS ==================

  onSelectionChange(newValue: string): void {
     this.collectionService.setSelectedCollectionId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load collections when component is initialized
    this.collectionService.ensureCollectionsLoaded();
  }
}
