import { Component, input, output, computed, inject } from '@angular/core';
import { Folder } from '../../../features/folders/folders.model';
import { FormInput } from '../../form/form-input/form-input';
import { FoldersStore } from '../../../features/folders/folders.store';

@Component({
  selector: 'app-foldersmenu-delete',
  imports: [FormInput],
  templateUrl: './foldersmenu-delete.html',
  styleUrl: './foldersmenu-delete.scss',
})
export class FoldersmenuDelete {
  private foldersStore = inject(FoldersStore);

  deleteFolder = output<void>();
  cancel = output<void>();

  selectedFolder = this.foldersStore.selectedFolder;
  folderName = computed(() => this.selectedFolder()?.name || '');
  loading = this.foldersStore.loading;

  onDeleteFolder() {
    if (!this.loading()) {
      this.deleteFolder.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
