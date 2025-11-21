import { Component, model, computed, inject, OnInit } from '@angular/core';
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

  // Two-way binding for selected folder ID
  selectedFolderId = model<string>('root');

  // Computed: loading state from folders store
  loading = this.foldersStore.loading;

  // Computed: transform folders to select options (excluding virtual folders)
  folderOptions = computed(() => {
    const folders = this.foldersStore.allFolders().filter(f => !f.isVirtual);
    return this.buildFolderOptions(folders);
  });

  ngOnInit(): void {
    // Load folders if not already loaded
    if (this.foldersStore.folders().length === 0) {
      this.foldersStore.loadFolders();
    }
  }

  /**
   * Build select options from folders with hierarchy indentation
   */
  private buildFolderOptions(folders: Folder[]): SelectOption[] {
    const options: SelectOption[] = [];

    // Add root option first (no specific folder selected)
    options.push({
      value: '',
      label: '(No folder / Root)'
    });

    // Recursive function to add folders with indentation
    const addFolder = (folder: Folder, depth: number = 0) => {
      const indent = '\u00A0\u00A0\u00A0'.repeat(depth); // Non-breaking spaces for proper indentation
      options.push({
        value: folder.id!,
        label: indent + folder.name
      });

      // Add children
      const children = folders
        .filter(f => f.parentId === folder.id)
        .sort((a, b) => a.order - b.order);

      children.forEach(child => addFolder(child, depth + 1));
    };

    // Start with root folders (no parent)
    const rootFolders = folders
      .filter(f => !f.parentId)
      .sort((a, b) => a.order - b.order);

    rootFolders.forEach(folder => addFolder(folder));

    return options;
  }
}
