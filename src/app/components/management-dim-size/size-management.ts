import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SizeService } from '../../features/dimensions/size/size.service';
import { SizeForm } from "./size-form/size-form";
import { SizeListItem } from "./size-list-item/size-list-item";
import { DimSize, createEmptySize } from '../../features/dimensions/dimensions.model';
import { GlobalService } from '../../features/global/global.service';

@Component({
  selector: 'app-size-management',
  imports: [CommonModule, SizeForm, SizeListItem],
  templateUrl: './size-management.html',
  styleUrl: './size-management.scss',
})
export class SizeManagement implements OnInit {
  private globalService = inject(GlobalService);
  private sizeService = inject(SizeService);

  // Use service signals directly
  sizes = this.sizeService.sizes;
  loading = this.globalService.loading;
  error = this.sizeService.error;

  newSize = signal<DimSize>(createEmptySize());

  alphaSortSizes = computed(() => {
    return this.sizes().sort((a, b) => {
      const textA = a.text.toLowerCase();
      const textB = b.text.toLowerCase();
      if (textA < textB) return -1;
      if (textA > textB) return 1;
      return 0;
    });
  });

  //  ==== FORM METHODS ====

  isValidSize = computed(() => {
    return this.newSize().text.trim() !== '';
  });

  onNewSize(size: DimSize) {
    this.newSize.set(size);
  }

  async addSize() {
    try {
      if (!this.isValidSize()) {
        return;
      }
      await this.sizeService.createSize(this.newSize());
      this.newSize.set(createEmptySize());
    } catch (err) {
      console.error(err);
    }
  }

  // ==== LIFECYCLE ======

  async ngOnInit() {
    await this.sizeService.ensureSizesLoaded();
    console.log('Sizes loaded:', this.sizes());
  }
}
