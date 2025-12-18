import { Component, inject, input, computed, OnInit, effect, untracked } from '@angular/core';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-dropdown-manufacturers',
  imports: [FormSelect],
  templateUrl: 'dropdown-manufacturers.html',
  styleUrl: 'dropdown-manufacturers.scss',
})
export class DropdownManufacturers implements OnInit {
  private globalService = inject(GlobalService);
  private manufacturerService = inject(ManufacturerService);

  // Get global loading state
  loading = this.globalService.loading;

  // ============ INPUTS ==================

  label = input<string>('Manufacturer');
  id = input<string>('manufacturer-select');
  placeholder = input<string>('Select a manufacturer');

  // ============ COMPUTED VALUES ==================

  // Current selected manufacturer from service
  currentValue = computed(() => this.manufacturerService.selectedManufacturerId());
  // Get all manufacturers sorted by order
  manufacturers = computed(() => {
    return this.manufacturerService.manufacturers();
  });
  // Convert manufacturers to SelectOption[] for FormSelect
  manufacturerOptions = computed<SelectOption[]>(() => {
    return this.manufacturers()
      .map(manufacturer => ({
        value: manufacturer.id || '',
        label: manufacturer.name || 'Unnamed Manufacturer',
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  // ============ ACTIONS ==================

  onSelectionChange(newValue: string): void {
     this.manufacturerService.setSelectedManufacturerId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load manufacturers when component is initialized
    this.manufacturerService.ensureManufacturersLoaded();
  }
}
