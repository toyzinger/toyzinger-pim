import { Component, inject, input, computed, OnInit } from '@angular/core';
import { SizeService } from '../../features/dimensions/size/size.service';
import { FormSelect, SelectOption } from '../form/form-select/form-select';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-dropdown-sizes',
  imports: [FormSelect],
  templateUrl: 'dropdown-sizes.html',
  styleUrl: 'dropdown-sizes.scss',
})
export class DropdownSizes implements OnInit {
  private globalService = inject(GlobalService);
  private sizeService = inject(SizeService);

  // Get global loading state
  loading = this.globalService.loading;

  // ============ INPUTS ==================

  label = input<string>('Size');
  id = input<string>('size-select');
  placeholder = input<string>('Select a size');

  // ============ COMPUTED VALUES ==================

  // Current selected size from service
  currentValue = computed(() => this.sizeService.selectedSizeId());
  // Get all sizes
  sizes = computed(() => {
    return this.sizeService.sizes();
  });
  // Convert sizes to SelectOption[] for FormSelect
  sizeOptions = computed<SelectOption[]>(() => {
    return this.sizes()
      .map(size => ({
        value: size.id || '',
        label: size.text || 'Unnamed Size',
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  // ============ ACTIONS ==================

  onSelectionChange(newValue: string): void {
     this.sizeService.setSelectedSizeId(newValue);
  }

  // ============ LIFECYCLE ==================

  ngOnInit() {
    // Load sizes when component is initialized
    this.sizeService.ensureSizesLoaded();
  }
}
