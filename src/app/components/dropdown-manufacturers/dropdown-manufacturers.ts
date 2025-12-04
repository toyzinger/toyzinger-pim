import { Component, inject, model, input, computed, OnInit } from '@angular/core';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-dropdown-manufacturers',
  imports: [FormSelect],
  templateUrl: 'dropdown-manufacturers.html',
  styleUrl: 'dropdown-manufacturers.scss',
})
export class DropdownManufacturers implements OnInit {
  private manufacturerService = inject(ManufacturerService);

  // ============ INPUTS ==================

  label = input<string>('Manufacturer');
  id = input<string>('manufacturer-select');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  placeholder = input<string>('Select a manufacturer');

  // ============ TWO-WAY BINDING ==================

  value = model<string>(''); // Model for selected manufacturer ID

  // ============ COMPUTED VALUES ==================

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

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load manufacturers when component is initialized
    this.manufacturerService.ensureManufacturersLoaded();
  }
}
