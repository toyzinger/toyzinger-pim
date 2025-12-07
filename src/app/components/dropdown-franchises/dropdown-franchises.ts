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
  language = input<'en' | 'es'>('en');

  // ============ TWO-WAY BINDING ==================

  value = model<string>('');

  // ============ COMPUTED VALUES ==================

  franchises = computed(() => this.franchiseService.franchises());

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

  constructor() {
    // Only sync FROM global TO local (one-way)
    effect(() => this.syncGlobalToLocal());
  }

  private syncGlobalToLocal(): void {
    console.log('===== syncGlobalToLocal');
    const globalFranchiseId = this.franchiseService.selectedFranchiseId();
    const localValue = untracked(() => this.value());
    console.log('localValue', localValue);
    console.log('globalFranchiseId', globalFranchiseId);
    if (globalFranchiseId !== localValue) {
      this.value.set(globalFranchiseId);
    }
  }

  // ============ ACTIONS ==================

  // Called when user explicitly changes the dropdown selection
  onSelectionChange(newValue: string): void {
    this.value.set(newValue);
    // Only sync to global on explicit user interaction
    this.franchiseService.setSelectedFranchiseId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    this.franchiseService.ensureFranchisesLoaded();
  }
}
