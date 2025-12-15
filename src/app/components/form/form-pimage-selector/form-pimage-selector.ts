import { Component, inject, model, signal, computed, OnInit, effect, viewChild, ElementRef } from '@angular/core';
import { ImagesService } from '../../../features/pimages/pimages.service';
import { FranchiseService } from '../../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../../features/dimensions/collection/collection.service';
import { SubCollectionService } from '../../../features/dimensions/subcollection/subcollection.service';
import { GlobalService } from '../../../features/global/global.service';
import { DropdownFranchises } from '../../dropdown-franchises/dropdown-franchises';
import { DropdownCollections } from '../../dropdown-collections/dropdown-collections';
import { DropdownSubCollections } from '../../dropdown-subcollections/dropdown-subcollections';

@Component({
  selector: 'app-form-pimage-selector',
  imports: [
    DropdownFranchises,
    DropdownCollections,
    DropdownSubCollections,
  ],
  templateUrl: './form-pimage-selector.html',
  styleUrl: './form-pimage-selector.scss',
})
export class FormPimageSelector implements OnInit {
  private imagesService = inject(ImagesService);
  private franchiseService = inject(FranchiseService);
  private collectionService = inject(CollectionService);
  private subCollectionService = inject(SubCollectionService);
  private globalService = inject(GlobalService);

  // Two-way binding for selected image IDs
  selectedImageIds = model<string[]>([]);

  // Loading state
  loading = this.globalService.loading;

  // Internal selection state (for UI)
  private _selectedIds = signal<Set<string>>(new Set());

  // Dialog element reference
  dialogElement = viewChild<ElementRef<HTMLDialogElement>>('dialogElement');

  // Filtered images based on dropdown selections
  filteredImages = computed(() => {
    const allImages = this.imagesService.images();
    const franchiseId = this.franchiseService.selectedFranchiseId();
    const collectionId = this.collectionService.selectedCollectionId();
    const subcollectionId = this.subCollectionService.selectedSubCollectionId();

    let filtered = allImages;

    // Filter by subcollection (most specific)
    if (subcollectionId) {
      filtered = filtered.filter(img => img.subcollectionId === subcollectionId);
    }
    // Filter by collection if no subcollection selected
    else if (collectionId) {
      // Get all subcollections for this collection
      const subcollections = this.subCollectionService.subcollections()
        .filter(sc => sc.collectionId === collectionId)
        .map(sc => sc.id);
      filtered = filtered.filter(img =>
        img.subcollectionId && subcollections.includes(img.subcollectionId)
      );
    }
    // Filter by franchise if no collection selected
    else if (franchiseId) {
      // Get all collections for this franchise
      const collections = this.collectionService.collections()
        .filter(c => c.franchiseId === franchiseId)
        .map(c => c.id);
      // Get all subcollections for these collections
      const subcollections = this.subCollectionService.subcollections()
        .filter(sc => sc.collectionId && collections.includes(sc.collectionId))
        .map(sc => sc.id);
      filtered = filtered.filter(img =>
        img.subcollectionId && subcollections.includes(img.subcollectionId)
      );
    }

    return filtered;
  });

  // ============ EFFECTS ==================

  constructor() {
    effect(() => this.syncSelectionFromModel());
  }

  private syncSelectionFromModel(): void {
    const ids = this.selectedImageIds();
    this._selectedIds.set(new Set(ids));
  }

  // ============ METHODS ==================

  toggleImageSelection(imageId: string): void {
    const current = new Set(this._selectedIds());

    if (current.has(imageId)) {
      current.delete(imageId);
    } else {
      current.add(imageId);
    }

    this._selectedIds.set(current);
    this.selectedImageIds.set(Array.from(current));
  }

  isImageSelected(imageId: string): boolean {
    return this._selectedIds().has(imageId);
  }

  clearSelection(): void {
    this._selectedIds.set(new Set());
    this.selectedImageIds.set([]);
  }

  getImageUrl(filename: string): string {
    return `/uploads/images/${filename}`;
  }

  getImageById(imageId: string) {
    return this.imagesService.images().find(img => img.id === imageId);
  }

  openModal(): void {
    this.dialogElement()?.nativeElement.showModal();
  }

  closeModal(): void {
    this.dialogElement()?.nativeElement.close();
  }

  onDialogClick(event: MouseEvent): void {
    // Si el click fue directamente en el dialog (backdrop), cerrarlo
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // ============ LIFECYCLE ==================

  ngOnInit(): void {
    // Ensure data is loaded
    this.imagesService.ensureImagesLoaded();
    this.franchiseService.ensureFranchisesLoaded();
    this.collectionService.ensureCollectionsLoaded();
    this.subCollectionService.ensureSubCollectionsLoaded();
  }
}
