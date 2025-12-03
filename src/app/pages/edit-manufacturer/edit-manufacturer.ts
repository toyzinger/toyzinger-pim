import { Component, inject, input, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';
import { ManufacturerForm } from "../../components/management-dim-manufacturer/manufacturer-form/manufacturer-form";
import { DimManufacturer, createEmptyManufacturer } from '../../features/dimensions/dimensions.model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-edit-manufacturer',
  imports: [CommonModule, ManufacturerForm, RouterLink],
  templateUrl: './edit-manufacturer.html',
  styleUrl: './edit-manufacturer.scss',
})
export class EditManufacturer implements OnInit {
private manufacturerService = inject(ManufacturerService);

  // Input from route param :id
  id = input.required<string>();
  // Find manufacturer by ID from the store
  manufacturer = computed(() => {
    const manufacturerId = this.id();
    return this.manufacturerService.manufacturers().find(m => m.id === manufacturerId);
  });
  // Loading state
  loading = this.manufacturerService.loading;
  // Error state
  error = this.manufacturerService.error;

  // Updated manufacturer data (from form)
  updatedManufacturerData = signal<DimManufacturer>(createEmptyManufacturer());
  // Check if manufacturer data is valid
  isDataValid = computed(() => {
    return this.updatedManufacturerData().name.trim() !== '';
  });

  ngOnInit() {
    // Ensure manufacturers are loaded so we can find the one to edit
    this.manufacturerService.ensureManufacturersLoaded();
  }

  // Handle updated manufacturer data from the form
  updatedManufacturerDataChange(updatedManufacturerData: DimManufacturer) {
    this.updatedManufacturerData.set(updatedManufacturerData);
  }

  // Handle form submission (update manufacturer)
  onSubmit() {
    if (!this.isDataValid() || this.loading()) {
      return;
    }
    try {
      this.manufacturerService.updateManufacturer(this.id(), this.updatedManufacturerData());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating manufacturer:', error);
    }
  }
}
