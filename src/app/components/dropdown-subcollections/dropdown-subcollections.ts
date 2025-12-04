import { Component, inject, model, input, computed, OnInit, effect, untracked } from '@angular/core';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-dropdown-subcollections',
  imports: [FormSelect],
  templateUrl: 'dropdown-subcollections.html',
  styleUrl: 'dropdown-subcollections.scss',
})
export class DropdownSubCollections implements OnInit {
  private subCollectionService = inject(SubCollectionService);

  // ============ INPUTS ==================

  label = input<string>('SubCollection');
  placeholder = input<string>('Select a subcollection');
  id = input<string>('subcollection-select');
  required = input<boolean>(false);
  loading = input<boolean>(false);
  language = input<'en' | 'es'>('en'); // Language for subcollection names
  filteredByCollection = input.required<string>(); // CollectionId to filter subcollections by

  // ============ TWO-WAY BINDING ==================

  value = model<string>(''); // Model for selected subcollection ID

  // ============ COMPUTED VALUES ==================

  disabled = computed(() => !this.filteredByCollection() || this.loading());

  // ============ COMPUTED VALUES ==================

  // Get subcollections, filtered by collection ID
  subcollections = computed(() => {
    const allSubCollections = this.subCollectionService.sortedSubCollections();
    const collectionId = this.filteredByCollection();

    // If no collection is selected, return empty list (or all? usually dependent dropdowns return empty)
    // Based on user request "ha de recibir como input un collectionId obligatoriamente, ha de recoger este collectionId y filtrar"
    if (!collectionId) return [];

    return allSubCollections.filter(sc => sc.collectionId === collectionId);
  });

  // Convert subcollections to SelectOption[] for FormSelect
  subCollectionOptions = computed<SelectOption[]>(() => {
    const lang = this.language();
    return this.subcollections().map(sc => ({
      value: sc.id || '',
      label: sc.name[lang] || sc.name.en || 'Unnamed SubCollection',
    }));
  });

  // ============ EFFECTS ==================

  private isInitialized = false;

  constructor() {
    effect(() => this.clearValueIfNotInFilteredSubCollections());
  }

  // Clear value if it's not in the filtered subcollections (only after initialization)
  private clearValueIfNotInFilteredSubCollections(): void {
    this.filteredByCollection(); // Track filter changes
    // Skip on initialization - let the parent's value take precedence
    if (!this.isInitialized) return;
    // Read value without tracking to avoid circular dependency
    const currentValue = untracked(() => this.value());
    if (currentValue === '') return;
    // Check if current value exists in filtered subcollections
    const validIds = untracked(() => this.subcollections().map(sc => sc.id || ''));
    if (!validIds.includes(currentValue)) {
      this.value.set('');
    }
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load subcollections when component is initialized
    this.subCollectionService.ensureSubCollectionsLoaded();
    // Mark as initialized after potential parent value is set
    setTimeout(() => {
      this.isInitialized = true;
    });
  }
}
