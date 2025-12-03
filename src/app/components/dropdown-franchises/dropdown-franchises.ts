import { Component, inject, model, input, computed, OnInit, effect, untracked } from '@angular/core';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-dropdown-franchises',
  imports: [FormSelect],
  templateUrl: 'dropdown-franchises.html',
  styleUrl: 'dropdown-franchises.scss',
})
export class DropdownFranchises implements OnInit {
  private franchiseService = inject(FranchiseService);

  // ========================================
  // INPUTS
  // ========================================

  label = input<string>('Franchise');
  placeholder = input<string>('Select a franchise');
  id = input<string>('franchise-select');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  language = input<'en' | 'es'>('en'); // Language for franchise names
  filtered = input<string[]>([]); // Array of franchise IDs to filter by

  // ========================================
  // TWO-WAY BINDING
  // ========================================

  // Model for selected franchise ID
  value = model<string>('');

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Get franchises, optionally filtered by ID array
  franchises = computed(() => {
    const allFranchises = this.franchiseService.sortedFranchises();
    const filteredIds = this.filtered();

    // If filtered array is empty, return all franchises
    if (filteredIds.length === 0) {
      return allFranchises;
    }

    // Otherwise, only return franchises whose ID is in the filtered array
    return allFranchises.filter(franchise => filteredIds.includes(franchise.id || ''));
  });

  // Convert franchises to SelectOption[] for FormSelect
  franchiseOptions = computed<SelectOption[]>(() => {
    const lang = this.language();
    return this.franchises()
      .map(franchise => ({
        value: franchise.id || '',
        label: franchise.name[lang] || franchise.name.en || 'Unnamed Franchise',
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  // ========================================
  // CONSTRUCTOR
  // ========================================

  constructor() {
    // Effect 1: Track global changes, update local (untracked read of local)
    effect(() => {
      const globalFranchiseId = this.franchiseService.selectedFranchiseId();
      // Read local value without tracking it
      const localValue = untracked(() => this.value());
      // Only update if different and franchise is in filtered list
      if (globalFranchiseId !== localValue) {
        const franchiseIds = untracked(() => this.franchises().map(f => f.id || ''));

        if (globalFranchiseId === '' || franchiseIds.includes(globalFranchiseId)) {
          this.value.set(globalFranchiseId);
        }
      }
    });

    // Effect 2: Track local changes, update global (untracked read of global)
    effect(() => {
      const localValue = this.value();
      // Read global value without tracking it
      const globalFranchiseId = untracked(() => this.franchiseService.selectedFranchiseId());
      // Only update global if local changed and is different
      if (localValue !== globalFranchiseId) {
        this.franchiseService.setSelectedFranchiseId(localValue);
      }
    });
  }

  // ========================================
  // LIFECYCLE
  // ========================================

  ngOnInit() {
    // Load franchises when component is initialized
    this.franchiseService.ensureFranchisesLoaded();
  }
}
