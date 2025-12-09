import { Component, inject, model, input, computed, OnInit, effect, untracked } from '@angular/core';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-dropdown-subcollections',
  imports: [FormSelect],
  templateUrl: 'dropdown-subcollections.html',
  styleUrl: 'dropdown-subcollections.scss',
})
export class DropdownSubCollections implements OnInit {
  private subCollectionService = inject(SubCollectionService);
  private collectionService = inject(CollectionService);

  // ============ INPUTS ==================

  label = input<string>('SubCollection');
  placeholder = input<string>('Select a subcollection');
  id = input<string>('subcollection-select');
  required = input<boolean>(false);
  loading = input<boolean>(false);
  language = input<'en' | 'es'>('en'); // Language for subcollection names

  // ============ COMPUTED VALUES ==================

   // Current selected subcollection from service
  currentValue = computed(() => this.subCollectionService.selectedSubCollectionId());
  // Get current collection selection from service
  collectionId = computed(() => this.collectionService.selectedCollectionId());
  disabled = computed(() => !this.collectionId() || this.loading());

  // Get subcollections, filtered by global collection selection
  subcollections = computed(() => {
    const allSubCollections = this.subCollectionService.sortedSubCollections();
    const collectionId = this.collectionId();

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

  constructor() {
    // Validate subcollection when collection changes
    effect(() => this.validateSubCollectionAgainstCollection());
  }

  // Ensure selected subcollection belongs to the selected collection
  private validateSubCollectionAgainstCollection(): void {
    const collectionId = this.collectionId();
    const subCollectionId = untracked(() => this.subCollectionService.selectedSubCollectionId());

    if (subCollectionId) {
      const subCollection = this.subCollectionService.getSubCollectionById()(subCollectionId);
      // Clear subcollection if collection is cleared OR if subcollection doesn't belong to new collection
      if (!collectionId || (subCollection && subCollection.collectionId !== collectionId)) {
        console.log('Clearing invalid subcollection for collection', collectionId);
        this.subCollectionService.clearSelectedSubCollectionId();
      }
    }
  }

  // ============ ACTIONS ==================

  onSelectionChange(newValue: string): void {
     this.subCollectionService.setSelectedSubCollectionId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load subcollections when component is initialized
    this.subCollectionService.ensureSubCollectionsLoaded();
  }
}
