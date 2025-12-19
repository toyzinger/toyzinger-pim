import { Component, inject, model, input, computed, OnInit, effect, untracked, output } from '@angular/core';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-dropdown-subcollections',
  imports: [FormSelect],
  templateUrl: 'dropdown-subcollections.html',
  styleUrl: 'dropdown-subcollections.scss',
})
export class DropdownSubCollections implements OnInit {
  private globalService = inject(GlobalService);
  private subCollectionService = inject(SubCollectionService);
  private collectionService = inject(CollectionService);

  // Get global loading state
  loading = this.globalService.loading;

  // ============ INPUTS / OUTPUTS ==================

  label = input<string>('SubCollection');
  placeholder = input<string>('Select a subcollection');
  language = input<'en' | 'es'>('en'); // Language for subcollection names

  // Prevents update Servic value, use Output instead to get value
  useService = input<boolean>(true);
  onChange = output<string>();

  // Internal model for two-way binding with FormSelect
  selectedValue = model<string>('');

  // ============ COMPUTED VALUES ==================

   // Current selected subcollection from service
  currentValue = computed(() => this.subCollectionService.selectedSubCollectionId());
  // Get current collection selection from service
  collectionId = computed(() => this.collectionService.selectedCollectionId());
  // Disable dropdown if no collection selected or loading
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
    // Emit change event
    this.onChange.emit(newValue);
    // Update service selection if using service
    if (this.useService()) this.subCollectionService.setSelectedSubCollectionId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load subcollections when component is initialized
    this.subCollectionService.ensureSubCollectionsLoaded();
  }
}
