import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { FranchiseForm } from "./franchise-form/franchise-form";
import { FranchiseListItem } from "./franchise-list-item/franchise-list-item";
import { DimFranchise, createEmptyFranchise } from '../../features/dimensions/dimensions.model';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-franchise-management',
  imports: [CommonModule, FranchiseForm, FranchiseListItem],
  templateUrl: './franchise-management.html',
  styleUrl: './franchise-management.scss',
})
export class FranchiseManagement implements OnInit {
  private franchiseService = inject(FranchiseService);
  private globalService = inject(GlobalService);

  // Use service signals directly
  franchises = this.franchiseService.franchises;
  loading = this.globalService.loading;
  error = this.franchiseService.error;

  newFranchise = signal<DimFranchise>(createEmptyFranchise());

  isValidFranchise = computed(() => {
    return this.newFranchise().name.en.trim() !== '' && this.newFranchise().name.es.trim() !== '';
  });

  alphaSortFranchises = computed(() => {
    return this.franchises().sort((a, b) => {
      const nameA = a.name.en.toLowerCase();
      const nameB = b.name.en.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  });

  async ngOnInit() {
    await this.franchiseService.ensureFranchisesLoaded();
  }

  onNewFranchise(franchise: DimFranchise) {
    this.newFranchise.set(franchise);
  }

  async addFranchise() {
    try {
      if (!this.isValidFranchise()) {
        return;
      }
      await this.franchiseService.createFranchise(this.newFranchise());
      this.newFranchise.set(createEmptyFranchise());
    } catch (err) {
      // Error is already handled by the service
      console.error(err);
    }
  }
}
