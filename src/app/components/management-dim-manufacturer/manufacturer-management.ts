import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManufacturerService } from '../../features/dimensions/manufacturer/manufacturer.service';
import { ManufacturerForm } from "./manufacturer-form/manufacturer-form";
import { ManufacturerListItem } from "./manufacturer-list-item/manufacturer-list-item";
import { DimManufacturer, createEmptyManufacturer } from '../../features/dimensions/dimensions.model';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-manufacturer-management',
  imports: [CommonModule, ManufacturerForm, ManufacturerListItem],
  templateUrl: './manufacturer-management.html',
  styleUrl: './manufacturer-management.scss',
})
export class ManufacturerManagement implements OnInit {
  private globalService = inject(GlobalService);
  private manufacturerService = inject(ManufacturerService);

  // Use service signals directly
  manufacturers = this.manufacturerService.manufacturers;
  loading = this.globalService.loading;
  error = this.manufacturerService.error;

  newManufacturer = signal<DimManufacturer>(createEmptyManufacturer());

  isValidManufacturer = computed(() => {
    return this.newManufacturer().name.trim() !== '';
  });

  alphaSortManufacturers = computed(() => {
    return this.manufacturers().sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  });

  async ngOnInit() {
    await this.manufacturerService.ensureManufacturersLoaded();
  }

  onNewManufacturer(manufacturer: DimManufacturer) {
    this.newManufacturer.set(manufacturer);
  }

  async addManufacturer() {
    try {
      if (!this.isValidManufacturer()) {
        return;
      }
      await this.manufacturerService.createManufacturer(this.newManufacturer());
      this.newManufacturer.set(createEmptyManufacturer());
    } catch (err) {
      // Error is already handled by the service
      console.error(err);
    }
  }
}
