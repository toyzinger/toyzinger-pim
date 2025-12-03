import { Component, input, inject } from '@angular/core';
import { DimFranchise } from '../../../features/dimensions/dimensions.model';
import { Router } from '@angular/router';
import { FranchiseService } from '../../../features/dimensions/franchise/franchise.service';


@Component({
  selector: 'tr[app-franchise-list-item]',
  imports: [],
  templateUrl: './franchise-list-item.html',
  styleUrl: './franchise-list-item.scss',
})
export class FranchiseListItem {
  franchiseService = inject(FranchiseService);
  franchise = input.required<DimFranchise>();

  constructor(private router: Router) {}

  onEdit() {
    this.router.navigate(['franchise', this.franchise().id]);
  }

  onDelete() {
    const franchiseId = this.franchise().id;
    if (franchiseId && confirm('Are you sure you want to delete this franchise?')) {
      this.franchiseService.deleteFranchise(franchiseId);
    }
  }
}
