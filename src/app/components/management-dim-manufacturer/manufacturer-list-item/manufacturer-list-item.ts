import { Component, input, inject } from '@angular/core';
import { DimManufacturer } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { ManufacturerService } from '../../../features/dimensions/manufacturer/manufacturer.service';


@Component({
  selector: 'tr[app-manufacturer-list-item]',
  imports: [],
  templateUrl: './manufacturer-list-item.html',
  styleUrl: './manufacturer-list-item.scss',
})
export class ManufacturerListItem {
  manufacturerService = inject(ManufacturerService);
  manufacturer = input.required<DimManufacturer>();

  constructor(private router: Router) {}

  onEdit() {
    this.router.navigate(['manufacturer', this.manufacturer().id]);
  }

  onDelete() {
    const manufacturerId = this.manufacturer().id;
    if (manufacturerId && confirm('Are you sure you want to delete this manufacturer?')) {
      this.manufacturerService.deleteManufacturer(manufacturerId);
    }
  }
}
