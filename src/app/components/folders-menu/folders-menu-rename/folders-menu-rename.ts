import { Component, input, output, signal, effect, inject } from '@angular/core';
import { Folder } from '../../../features/folders/folders.model';
import { FormInput } from '../../form/form-input/form-input';
import { FoldersService } from '../../../features/folders/folders.service';

@Component({
  selector: 'app-folders-menu-rename',
  imports: [FormInput],
  templateUrl: './folders-menu-rename.html',
  styleUrl: './folders-menu-rename.scss',
})
export class FoldersmenuRename {
  private foldersStore = inject(FoldersService);

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
