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

  // ============ INPUTS ==================

  label = input<string>('Franchise');
  placeholder = input<string>('Select a franchise');
  id = input<string>('franchise-select');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  language = input<'en' | 'es'>('en'); // Language for franchise names
  filtered = input<string[]>([]); // Array of franchise IDs to filter by

  // ============ TWO-WAY BINDING ==================

  value = model<string>(''); // Model for selected franchise ID

  // ============ COMPUTED VALUES ==================

  // Get franchises, optionally filtered by ID array
  franchises = computed(() => {
    const allFranchises = this.franchiseService.franchises();
    const filteredIds = this.filtered();
    // If filtered array is empty, return all franchises
    if (filteredIds.length === 0) return allFranchises;
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

  // ============ EFFECTS ==================

  private isInitialized = false;

  constructor() {
    effect(() => this.syncGlobalToLocal());
    effect(() => this.syncLocalToGlobal());
  }

  // Sync global selectedFranchiseId to local value (after initialization)
  private syncGlobalToLocal(): void {
    const globalFranchiseId = this.franchiseService.selectedFranchiseId();
    // Skip on initialization - let the parent's value take precedence
    if (!this.isInitialized) return;
    // Read local value without tracking it
    const localValue = untracked(() => this.value());
    // Only update if different and franchise is in filtered list
    console.log('syncGlobalToLocal ========', globalFranchiseId, localValue);
    console.log('globalFranchiseId', globalFranchiseId);
    console.log('localValue (untracked)', localValue);
    if (globalFranchiseId !== localValue) {
      const franchiseIds = untracked(() => this.franchises().map(f => f.id || ''));
      if (globalFranchiseId === '' || franchiseIds.includes(globalFranchiseId)) {
        this.value.set(globalFranchiseId);
      }
    }
  }

  // Sync local value to global selectedFranchiseId
  private syncLocalToGlobal(): void {
    const localValue = this.value();
    // Read global value without tracking it
    const globalFranchiseId = untracked(() => this.franchiseService.selectedFranchiseId());
    // Only update global if local changed and is different
    console.log('syncLocalToGlobal =======');
    console.log('localValue', localValue);
    console.log('globalFranchiseId (untracked)', globalFranchiseId);
    if (localValue !== globalFranchiseId) {
      this.franchiseService.setSelectedFranchiseId(localValue);
    }
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load franchises when component is initialized
    this.franchiseService.ensureFranchisesLoaded();
    // Mark as initialized after potential parent value is set
    setTimeout(() => {
      this.isInitialized = true;
    });
  }
}
