import { Component, input, output, computed, signal, inject } from '@angular/core';
import { Folder } from '../../../features/folders/folders.model';
import { FormInput } from '../../form/form-input/form-input';
import { FoldersStore } from '../../../features/folders/folders.store';

@Component({
  selector: 'app-foldersmenu-new',
  imports: [FormInput],
  templateUrl: './foldersmenu-new.html',
  styleUrl: './foldersmenu-new.scss',
})
export class FoldersmenuNew {
  private foldersStore = inject(FoldersStore);

  createFolder = output<string>();
  cancel = output<void>();

  newFolderName = signal<string>('');
  selectedFolder = this.foldersStore.selectedFolder;
  selectedFolderName = computed(() => this.selectedFolder()?.name || 'Root');
  loading = this.foldersStore.loading;

  onCreateFolder() {
    const name = this.newFolderName().trim();
    if (name && !this.loading()) {
      this.createFolder.emit(name);
      this.newFolderName.set('');
    }
  }

  onCancel() {
    this.newFolderName.set('');
    this.cancel.emit();
  }
}
