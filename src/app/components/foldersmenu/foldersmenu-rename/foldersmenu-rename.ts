import { Component, input, output, signal, effect, inject } from '@angular/core';
import { Folder } from '../../../features/folders/folders.model';
import { FormInput } from '../../form/form-input/form-input';
import { FoldersStore } from '../../../features/folders/folders.store';

@Component({
  selector: 'app-foldersmenu-rename',
  imports: [FormInput],
  templateUrl: './foldersmenu-rename.html',
  styleUrl: './foldersmenu-rename.scss',
})
export class FoldersmenuRename {
  private foldersStore = inject(FoldersStore);

  renameFolder = output<string>();
  cancel = output<void>();

  folderName = signal<string>('');
  selectedFolder = this.foldersStore.selectedFolder;
  loading = this.foldersStore.loading;

  constructor() {
    effect(() => {
      const folder = this.selectedFolder();
      const isLoading = this.loading();

      // Update folder name when folder changes or after loading completes
      if (folder && !isLoading) {
        this.folderName.set(folder.name);
      }
    });
  }

  onRenameFolder() {
    const name = this.folderName().trim();
    if (name && name !== this.selectedFolder()?.name && !this.loading()) {
      this.renameFolder.emit(name);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
