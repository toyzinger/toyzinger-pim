import { Component, inject, model, input, computed, effect } from '@angular/core';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-dropdown-franchises',
  imports: [FormSelect],
  templateUrl: 'dropdown-franchises.html',
  styleUrl: 'dropdown-franchises.scss',
})
export class DropdownFranchises {
  private franchiseService = inject(FranchiseService);

  // ========================================
  // INPUTS
  // ========================================

  label = input<string>('Franchise');
  id = input<string>('franchise-select');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  placeholder = input<string>('Select a franchise');
  onlyActive = input<boolean>(false); // Show only active franchises by default
  language = input<'en' | 'es'>('en'); // Language for franchise names

  // ========================================
  // TWO-WAY BINDING
  // ========================================

  // Model for selected franchise ID
  value = model<string>('');

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Get franchises based on onlyActive flag
  franchises = computed(() => {
    if (this.onlyActive()) {
      return this.franchiseService.activeFranchises();
    }
    return this.franchiseService.sortedFranchises();
  });

  // Convert franchises to SelectOption[] for FormSelect
  franchiseOptions = computed<SelectOption[]>(() => {
    const lang = this.language();
    return this.franchises().map(franchise => ({
      value: franchise.id || '',
      label: franchise.name[lang] || franchise.name.en || 'Unnamed Franchise',
    }));
  });

  // ========================================
  // LIFECYCLE
  // ========================================

  constructor() {
    // Load franchises when component is created
    effect(() => {
      this.franchiseService.ensureFranchisesLoaded();
    }, { allowSignalWrites: true });
  }
}
