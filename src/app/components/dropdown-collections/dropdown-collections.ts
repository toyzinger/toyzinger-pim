import { Component, inject, model, input, computed, OnInit, effect, untracked } from '@angular/core';
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

  // ============ INPUTS ==================

  label = input<string>('Collection');
  placeholder = input<string>('Select a collection');
  id = input<string>('collection-select');
  required = input<boolean>(false);
  loading = input<boolean>(false);
  language = input<'en' | 'es'>('en'); // Language for collection names
  filteredByFranchise = input.required<string>(); // FranchiseId to filter collections by

  // ============ TWO-WAY BINDING ==================

  value = model<string>(''); // Model for selected collection ID

  // ============ COMPUTED VALUES ==================

  disabled = computed(() => !this.filteredByFranchise() || this.loading());

  // ============ COMPUTED VALUES ==================

  // Get collections, optionally filtered by ID array
  collections = computed(() => {
    const allCollections = this.collectionService.sortedCollections();
    const franchiseId = this.filteredByFranchise();
    // If filtered array is empty, return all collections
    if (franchiseId === '') return allCollections;
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

  // ============ EFFECTS ==================

  private isInitialized = false;

  constructor() {
    effect(() => this.clearValueIfNotInFilteredCollections());
  }

  // Clear value if it's not in the filtered collections (only after initialization)
  private clearValueIfNotInFilteredCollections(): void {
    this.filteredByFranchise(); // Track filter changes
    // Skip on initialization - let the parent's value take precedence
    if (!this.isInitialized) return;
    // Read value without tracking to avoid circular dependency
    const currentValue = untracked(() => this.value());
    if (currentValue === '') return;
    // Check if current value exists in filtered collections
    const validIds = untracked(() => this.collections().map(c => c.id || ''));
    if (!validIds.includes(currentValue)) {
      this.value.set('');
    }
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load collections when component is initialized
    this.collectionService.ensureCollectionsLoaded();
    // Mark as initialized after potential parent value is set
    setTimeout(() => {
      this.isInitialized = true;
    });
  }
}
