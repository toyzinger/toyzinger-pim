import { Component, inject, input, computed, OnInit } from '@angular/core';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-dropdown-franchises',
  imports: [FormSelect],
  templateUrl: 'dropdown-franchises.html',
  styleUrl: 'dropdown-franchises.scss',
})
export class DropdownFranchises implements OnInit {
  private globalService = inject(GlobalService);
  private franchiseService = inject(FranchiseService);

  // Get global loading state
  loading = this.globalService.loading;

  // ============ INPUTS ==================

  label = input<string>('Franchise');
  placeholder = input<string>('Select a franchise');
  id = input<string>('franchise-select');
  language = input<'en' | 'es'>('en');

  // ============ COMPUTED VALUES ==================

  franchises = computed(() => this.franchiseService.franchises());

  // Current value comes from the service
  currentValue = computed(() => this.franchiseService.selectedFranchiseId());

  franchiseOptions = computed<SelectOption[]>(() => {
    const lang = this.language();
    return this.franchises()
      .map(franchise => ({
        value: franchise.id || '',
        label: franchise.name[lang] || franchise.name.en || 'Unnamed Franchise',
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  // ============ ACTIONS ==================

  // Called when user explicitly changes the dropdown selection
  onSelectionChange(newValue: string): void {
    // Update the service, which is the Source of Truth
    this.franchiseService.setSelectedFranchiseId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    this.franchiseService.ensureFranchisesLoaded();
  }
}
