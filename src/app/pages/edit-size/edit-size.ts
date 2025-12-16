import { Component, inject, input, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SizeService } from '../../features/dimensions/size/size.service';
import { SizeForm } from "../../components/management-dim-size/size-form/size-form";
import { DimSize, createEmptySize } from '../../features/dimensions/dimensions.model';
import { TitlePage } from "../../components/title-page/title-page";
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-edit-size',
  imports: [CommonModule, SizeForm, TitlePage],
  templateUrl: './edit-size.html',
  styleUrl: './edit-size.scss',
})
export class EditSize implements OnInit {
  private globalService = inject(GlobalService);
  private sizeService = inject(SizeService);

  // Input from route param :id
  id = input.required<string>();
  // Find size by ID from the store
  size = computed(() => {
    const sizeId = this.id();
    return this.sizeService.sizes().find(s => s.id === sizeId);
  });
  // Loading state
  loading = this.globalService.loading;
  // Error state
  error = this.sizeService.error;

  // Updated size data (from form)
  updatedSizeData = signal<DimSize>(createEmptySize());
  // Check if size data is valid
  isDataValid = computed(() => {
    return this.updatedSizeData().text.trim() !== '';
  });

  ngOnInit() {
    // Ensure sizes are loaded so we can find the one to edit
    this.sizeService.ensureSizesLoaded();
  }

  // Handle updated size data from the form
  onUpdatedSize(updatedSizeData: DimSize) {
    this.updatedSizeData.set(updatedSizeData);
  }

  // Handle form submission (update size)
  onSubmit() {
    if (!this.isDataValid() || this.loading()) {
      return;
    }
    try {
      this.sizeService.updateSize(this.id(), this.updatedSizeData());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating size:', error);
    }
  }
}
