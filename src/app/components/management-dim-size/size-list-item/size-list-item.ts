import { Component, input, inject } from '@angular/core';
import { DimSize } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { SizeService } from '../../../features/dimensions/size/size.service';
import { FormOrderList } from '../../form/form-order-list/form-order-list';

@Component({
  selector: 'tr[app-size-list-item]',
  imports: [FormOrderList],
  templateUrl: './size-list-item.html',
  styleUrl: './size-list-item.scss',
})
export class SizeListItem {
  sizeService = inject(SizeService);
  size = input.required<DimSize>();

  constructor(private router: Router) {}

  onEdit() {
    this.router.navigate(['size', this.size().id]);
  }

  onDelete() {
    const sizeId = this.size().id;
    if (sizeId && confirm('Are you sure you want to delete this size?')) {
      this.sizeService.deleteSize(sizeId);
    }
  }

  updateOrder(newValue: number | undefined) {
    const sizeId = this.size().id;
    if (
      !sizeId
      || newValue === undefined
      || newValue < 0
      || isNaN(newValue)
      || newValue === this.size().order
    ) {
        //Escape hatch for invalid values
        return;
    }

    this.sizeService.updateSize(sizeId, { order: newValue });
  }
}
