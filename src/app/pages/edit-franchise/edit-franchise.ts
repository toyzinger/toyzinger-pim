import { Component, inject, input, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { FranchiseForm } from "../../components/franchise-form/franchise-form";
import { DimFranchise, createEmptyFranchise } from '../../features/dimensions/dimensions.model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-edit-franchise',
  imports: [CommonModule, FranchiseForm, RouterLink],
  templateUrl: './edit-franchise.html',
  styleUrl: './edit-franchise.scss',
})
export class EditFranchise implements OnInit {
private franchiseService = inject(FranchiseService);

  // Input from route param :id
  id = input.required<string>();
  // Find franchise by ID from the store
  franchise = computed(() => {
    const franchiseId = this.id();
    return this.franchiseService.franchises().find(p => p.id === franchiseId);
  });
  // Loading state
  loading = this.franchiseService.loading;
  // Error state
  error = this.franchiseService.error;

  // Updated franchise data (from form)
  updatedFranchiseData = signal<DimFranchise>(createEmptyFranchise());
  // Check if franchise data is valid
  isDataValid = computed(() => {
    return this.updatedFranchiseData().name.en.trim() !== '' || this.updatedFranchiseData().name.es.trim() !== '';
  });

  ngOnInit() {
    // Ensure franchises are loaded so we can find the one to edit
    this.franchiseService.ensureFranchisesLoaded();
  }

  // Handle updated franchise data from the form
  updatedFranchiseDataChange(updatedFranchiseData: DimFranchise) {
    this.updatedFranchiseData.set(updatedFranchiseData);
  }

  // Handle form submission (update franchise)
  onSubmit() {
    if (!this.isDataValid() || this.loading()) {
      return;
    }
    try {
      this.franchiseService.updateFranchise(this.id(), this.updatedFranchiseData());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating franchise:', error);
    }
  }
}
