import { Component, model, computed, signal, inject, OnInit, effect } from '@angular/core';
import { FoldersStore } from '../../features/folders/folders.store';
import { Folder } from '../../features/folders/folders.model';
import { FormSelect, SelectOption } from '../form/form-select/form-select';

@Component({
  selector: 'app-folders-dropdown',
  imports: [FormSelect],
  templateUrl: './folders-dropdown.html',
  styleUrl: './folders-dropdown.scss',
})
export class FoldersDropdown implements OnInit {
  private foldersStore = inject(FoldersStore);

  // Internal signals for the two dropdowns (public for template binding)
  firstLevelFolderId = signal<string>('');
  secondLevelFolderId = signal<string>('');

  // Output: computed from both dropdowns
  selectedFolderId = model<string>('');

  // Computed: loading state from folders store
  loading = this.foldersStore.loading;

  // Computed: First dropdown options (root folders only)
  firstLevelOptions = computed(() => {
    const folders = this.foldersStore.allFolders().filter(f => !f.isVirtual && !f.parentId);

    const options: SelectOption[] = [];

    // Add root option
    options.push({
      value: '',
      label: '(No folder / Root)'
    });

    // Add root folders sorted by order
    folders
      .sort((a, b) => a.order - b.order)
      .forEach(folder => {
        options.push({
          value: folder.id!,
          label: folder.name
        });
      });

    return options;
  });

  // Computed: Second dropdown options (children of selected first level folder)
  secondLevelOptions = computed(() => {
    const firstLevelId = this.firstLevelFolderId();

    if (!firstLevelId) {
      return [];
    }

    const allFolders = this.foldersStore.allFolders().filter(f => !f.isVirtual);
    return this.buildChildOptions(allFolders, firstLevelId);
  });

  // Computed: Check if second dropdown should be visible
  showSecondLevel = computed(() => this.secondLevelOptions().length > 0);

  constructor() {
    // Effect: Reset second dropdown when first dropdown changes
    effect(() => {
      const firstLevelId = this.firstLevelFolderId();
      this.secondLevelFolderId.set('');
    });

    // Effect: Update output selectedFolderId based on both dropdowns
    effect(() => {
      const firstId = this.firstLevelFolderId();
      const secondId = this.secondLevelFolderId();

      // If second level has a value, use it; otherwise use first level
      this.selectedFolderId.set(secondId || firstId);
    });
  }

  ngOnInit(): void {
    // Load folders if not already loaded
    if (this.foldersStore.folders().length === 0) {
      this.foldersStore.loadFolders();
    }
  }

  /**
   * Build select options for child folders with hierarchy indentation
   */
  private buildChildOptions(allFolders: Folder[], parentId: string): SelectOption[] {
    const options: SelectOption[] = [];

    // Recursive function to add folders with indentation
    const addFolder = (folder: Folder, depth: number = 0) => {
      const indent = '\u00A0\u00A0\u00A0'.repeat(depth); // Non-breaking spaces for proper indentation
      options.push({
        value: folder.id!,
        label: indent + folder.name
      });

      // Add children
      const children = allFolders
        .filter(f => f.parentId === folder.id)
        .sort((a, b) => a.order - b.order);

      children.forEach(child => addFolder(child, depth + 1));
    };

    // Start with direct children of the parent folder
    const children = allFolders
      .filter(f => f.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    children.forEach(folder => addFolder(folder));

    return options;
  }
}
